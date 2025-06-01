import random
import copy
import json
import datetime # Adicionado para timestamp
import requests # Adicionado para web scraping
from bs4 import BeautifulSoup # Adicionado para web scraping
import re # Adicionado para expressões regulares (datas)
from urllib.parse import urljoin # Para construir URLs completas

# --- Constantes ---
PONTOS_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
URL_WIKIPEDIA_BASE = "https://en.wikipedia.org"
URL_WIKIPEDIA_F1_2025_MAIN = "https://en.wikipedia.org/wiki/2025_Formula_One_World_Championship"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"


# --- Funções de Obtenção de Dados ---

def get_soup(url):
    """Faz uma requisição GET para a URL e retorna um objeto BeautifulSoup."""
    try:
        headers = {'User-Agent': USER_AGENT}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    except requests.exceptions.RequestException as e:
        print(f"Erro ao acessar a URL {url}: {e}")
        return None

def parse_standings_table(table_soup, source_description):
    """
    Analisa uma tabela de classificação de pilotos (soup object) e retorna lista de dados dos pilotos.
    """
    pilotos_data = []
    if not table_soup:
        return pilotos_data

    driver_col_idx = -1
    points_col_idx = -1
    header_row = table_soup.find('tr') 
    if not header_row: 
        thead = table_soup.find('thead')
        if thead: header_row = thead.find('tr')
    
    if header_row:
        ths = header_row.find_all('th')
        for i, th_tag in enumerate(ths):
            text = th_tag.get_text(strip=True).lower()
            if ("driver" == text or "entrant" == text) and driver_col_idx == -1 : # Priorizar "Driver" exato
                 driver_col_idx = i
            elif "points" == text and points_col_idx == -1:
                points_col_idx = i
        # Fallback se "Driver" exato não for encontrado, tentar com "in text"
        if driver_col_idx == -1:
            for i, th_tag in enumerate(ths):
                text = th_tag.get_text(strip=True).lower()
                if ("driver" in text or "entrant" in text) and driver_col_idx == -1:
                    driver_col_idx = i
                    break # Pegar o primeiro match flexível

    if driver_col_idx == -1 or points_col_idx == -1:
        missing_cols = []
        if driver_col_idx == -1: missing_cols.append("'Driver'/'Entrant'")
        if points_col_idx == -1: missing_cols.append("'Points'")
        print(f"Não foi possível identificar as colunas { ' e '.join(missing_cols) } na tabela de {source_description}.")
        return []

    tbody = table_soup.find('tbody')
    if not tbody: tbody = table_soup 

    # Iterar sobre as linhas, começando da segunda se a primeira foi o cabeçalho
    start_row_index = 0
    if header_row and header_row.parent == tbody : # Se o header_row encontrado está dentro do tbody
        # Isso pode acontecer se a tabela não tem <thead> explícito e o header_row foi pego do corpo
        # Nesse caso, precisamos garantir que não estamos pulando a primeira linha de dados se o header_row foi o primeiro <tr> geral.
        # No entanto, a lógica de pular a primeira linha em tbody.find_all('tr')[1:] é geralmente para pular o cabeçalho DENTRO do tbody.
        # Se o header_row foi pego de fora (ex: thead), então tbody.find_all('tr') já não o incluiria.
        # A lógica original de pular [1:] é mais segura se o cabeçalho já foi identificado e processado.
        pass # A lógica [1:] abaixo cuidará de pular o cabeçalho se ele for o primeiro filho do tbody.


    rows_to_parse = tbody.find_all('tr')
    if header_row and rows_to_parse and header_row == rows_to_parse[0]:
        rows_to_parse = rows_to_parse[1:] # Pular a primeira linha se for o cabeçalho já processado


    for row in rows_to_parse: 
        cols = row.find_all(['td', 'th']) 
        if len(cols) > max(driver_col_idx, points_col_idx):
            try:
                name_cell = cols[driver_col_idx]
                nome_piloto_tag = name_cell.find('a')
                nome_piloto = nome_piloto_tag.get_text(strip=True) if nome_piloto_tag else name_cell.get_text(strip=True)

                pontos_piloto_str = cols[points_col_idx].get_text(strip=True)
                pontos_piloto_str_cleaned = re.sub(r'\[.*?\]', '', pontos_piloto_str).strip()
                
                if not pontos_piloto_str_cleaned or not pontos_piloto_str_cleaned.isdigit():
                    pontos_piloto = 0
                else:
                    pontos_piloto = int(pontos_piloto_str_cleaned)

                if nome_piloto and len(nome_piloto) > 1: 
                     pilotos_data.append({"nome": nome_piloto, "pontuacao_total": pontos_piloto, "vitorias_simulacao": 0})
            except (ValueError, IndexError):
                continue
    return pilotos_data


def obter_dados_pilotos_e_corridas_wikipedia():
    """
    Coleta os dados dos pilotos e calcula as corridas restantes
    fazendo scraping da página principal da Wikipedia para a temporada.
    Retorna (lista_pilotos, corridas_restantes) ou (None, None) em caso de falha.
    """
    print(f"Acessando a página principal da temporada: {URL_WIKIPEDIA_F1_2025_MAIN}")
    main_soup = get_soup(URL_WIKIPEDIA_F1_2025_MAIN)
    if not main_soup:
        return None, None

    pilotos_data = None
    corridas_restantes = None

    # --- TENTATIVA 1: Encontrar tabela de classificação GERAL ("World Drivers' Championship standings") ---
    print("\nProcurando tabela de classificação de pilotos ('World Drivers' Championship standings')...")
    overall_standings_table = None
    
    # Priorizar busca por cabeçalho H2/H3
    possible_standings_titles = ["world drivers' championship standings", "drivers' standings", "championship standings"]
    found_by_heading = False
    for heading_level in ['h2', 'h3', 'h4']: # Procurar em diferentes níveis de cabeçalho
        for heading in main_soup.find_all(heading_level):
            heading_text_lower = "".join(heading.find_all(string=True, recursive=False)).strip().lower() # Texto direto do heading
            # Às vezes o texto está dentro de um <span> dentro do cabeçalho
            if not heading_text_lower and heading.find("span", class_="mw-headline"):
                 heading_text_lower = heading.find("span", class_="mw-headline").get_text(strip=True).lower()

            for target_title in possible_standings_titles:
                if target_title in heading_text_lower:
                    next_element = heading.find_next_sibling()
                    while next_element and next_element.name != 'table': # Procurar a próxima tabela
                        next_element = next_element.find_next_sibling()
                    if next_element and next_element.name == 'table':
                        # Verificar se é uma tabela de pilotos
                        th_texts = [th.get_text(strip=True).lower() for th in next_element.find_all('th', limit=10)]
                        if any("driver" in t for t in th_texts) and any("points" in t for t in th_texts):
                            overall_standings_table = next_element
                            print(f"Tabela de classificação de pilotos encontrada após cabeçalho: '{heading.get_text(strip=True)}'")
                            found_by_heading = True
                            break
            if found_by_heading: break
        if found_by_heading: break
            
    # Fallback para busca por legenda se não encontrado por cabeçalho
    if not overall_standings_table:
        print("Não encontrado por cabeçalho, tentando por legenda da tabela...")
        all_tables_for_caption = main_soup.find_all('table', class_=lambda x: x != 'infobox' and x != 'metadata')
        for table_candidate in all_tables_for_caption:
            caption_tag = table_candidate.find('caption')
            if caption_tag:
                caption_text_lower = caption_tag.get_text().lower()
                for target_caption_text in possible_standings_titles: # Reutilizar possible_standings_titles
                    if target_caption_text in caption_text_lower:
                        th_texts = [th.get_text(strip=True).lower() for th in table_candidate.find_all('th', limit=10)]
                        if any("driver" in t for t in th_texts) and any("points" in t for t in th_texts):
                            overall_standings_table = table_candidate
                            print(f"Tabela de classificação de pilotos encontrada com legenda: '{caption_tag.get_text(strip=True)}'")
                            break
                if overall_standings_table: break

    if overall_standings_table:
        pilotos_data = parse_standings_table(overall_standings_table, "classificação geral da página principal")
        if not pilotos_data:
            print("Falha ao processar a tabela de classificação de pilotos encontrada.")
    else:
        print("Tabela de classificação de pilotos ('World Drivers' Championship standings') não encontrada na página principal.")

    # --- ETAPA 2: Analisar Calendário ("Grands Prix") para determinar corridas restantes ---
    print("\nAnalisando calendário de 'Grands Prix' para corridas restantes...")
    calendar_table = None
    possible_calendar_titles = ["calendar", "grands prix", "race calendar"] # Títulos de cabeçalho para o calendário
    found_calendar_by_heading = False

    for heading_level in ['h2', 'h3', 'h4']:
        for heading in main_soup.find_all(heading_level):
            heading_text_lower = "".join(heading.find_all(string=True, recursive=False)).strip().lower()
            if not heading_text_lower and heading.find("span", class_="mw-headline"):
                 heading_text_lower = heading.find("span", class_="mw-headline").get_text(strip=True).lower()

            for target_title in possible_calendar_titles:
                if target_title in heading_text_lower:
                    next_element = heading.find_next_sibling()
                    while next_element and next_element.name != 'table':
                        next_element = next_element.find_next_sibling()
                    if next_element and next_element.name == 'table':
                        th_texts_cal = [th.get_text(strip=True).lower() for th in next_element.find_all('th', limit=5)]
                        if any(h in ["round", "grand prix", "date"] for h in th_texts_cal):
                            calendar_table = next_element
                            print(f"Tabela de calendário encontrada após cabeçalho: '{heading.get_text(strip=True)}'")
                            found_calendar_by_heading = True
                            break
            if found_calendar_by_heading: break
        if found_calendar_by_heading: break

    if not calendar_table: # Fallback para busca por legenda do calendário
        print("Calendário não encontrado por cabeçalho, tentando por legenda da tabela...")
        all_tables_for_cal_caption = main_soup.find_all('table', class_=lambda x: x != 'infobox' and x != 'metadata')
        for table_candidate in all_tables_for_cal_caption:
            caption_tag = table_candidate.find('caption')
            if caption_tag:
                caption_text_lower = caption_tag.get_text().lower()
                for target_caption_text in possible_calendar_titles: # Reutilizar possible_calendar_titles
                    if target_caption_text in caption_text_lower:
                        th_texts_cal = [th.get_text(strip=True).lower() for th in table_candidate.find_all('th', limit=5)]
                        if any(h in ["round", "grand prix", "date"] for h in th_texts_cal):
                            calendar_table = table_candidate
                            print(f"Tabela de calendário encontrada com legenda: '{caption_tag.get_text(strip=True)}'")
                            break
                if calendar_table: break
            
    if calendar_table:
        round_col_idx = -1
        winner_col_idx = -1 
        
        header_row_cal = calendar_table.find('tr')
        if not header_row_cal:
            thead_cal = calendar_table.find('thead')
            if thead_cal: header_row_cal = thead_cal.find('tr')

        if header_row_cal:
            ths_cal = header_row_cal.find_all('th')
            for i, th_tag in enumerate(ths_cal):
                text = th_tag.get_text(strip=True).lower()
                if "round" == text and round_col_idx == -1: 
                    round_col_idx = i
                if ("winning driver" in text or "winner" == text or "report" == text or "results" == text) and winner_col_idx == -1: # Adicionado "results"
                    winner_col_idx = i
            
            if round_col_idx == -1: # Fallback flexível para "round"
                 for i, th_tag in enumerate(ths_cal):
                    text = th_tag.get_text(strip=True).lower()
                    if "round" in text and round_col_idx == -1: 
                        round_col_idx = i; break
            if winner_col_idx == -1: # Fallback flexível para coluna de vencedor/report
                 for i, th_tag in enumerate(ths_cal):
                    text = th_tag.get_text(strip=True).lower()
                    if ("winning driver" in text or "winner" in text or "report" in text or "results" in text) and winner_col_idx == -1:
                        winner_col_idx = i; break


        if round_col_idx != -1 and winner_col_idx != -1:
            total_races_in_calendar = 0
            completed_races_count = 0
            
            tbody_cal = calendar_table.find('tbody')
            if not tbody_cal: tbody_cal = calendar_table

            rows_cal = tbody_cal.find_all('tr')
            # Se a primeira linha do tbody for o cabeçalho, pular
            if header_row_cal and rows_cal and header_row_cal == rows_cal[0]:
                rows_cal = rows_cal[1:]


            for row in rows_cal:
                cols = row.find_all(['td', 'th'])
                if len(cols) > max(round_col_idx, winner_col_idx):
                    try:
                        round_text = cols[round_col_idx].get_text(strip=True)
                        # Contar como uma corrida no calendário se o round for um número ou "TBA" (para temporadas futuras)
                        # ou se a linha tiver um número significativo de colunas (evitar notas de rodapé)
                        if round_text.isdigit() or round_text.lower() == "tba" or len(cols) > 3 : # Adicionado len(cols) > 3
                            total_races_in_calendar +=1
                        
                        winner_cell_content = cols[winner_col_idx].get_text(strip=True)
                        winner_link = cols[winner_col_idx].find('a') # Link na coluna do vencedor/report

                        # Considerar corrida completa se houver conteúdo na célula do vencedor que não seja TBD/TBA
                        # OU se houver um link (para o report da corrida)
                        is_completed = False
                        if winner_cell_content and winner_cell_content.lower() not in ["tbd", "tba", ""]:
                            is_completed = True
                        elif winner_link and winner_link.has_attr('href') and winner_link.get_text(strip=True).lower() not in ["tbd", "tba", ""]:
                            is_completed = True
                        
                        # Para contar como completada, o round também deve ser um número (não TBA)
                        if is_completed and round_text.isdigit():
                            completed_races_count += 1
                    except (IndexError, ValueError):
                        continue 

            if total_races_in_calendar > 0:
                corridas_restantes = total_races_in_calendar - completed_races_count
                print(f"Total de corridas no calendário: {total_races_in_calendar}, Corridas completadas: {completed_races_count}")
                print(f"Corridas restantes calculadas: {corridas_restantes}")
            else:
                print("Não foi possível determinar o total de corridas ou corridas completadas a partir do calendário.")
                corridas_restantes = None 
        else:
            missing_cal_cols = []
            if round_col_idx == -1: missing_cal_cols.append("'Round'")
            if winner_col_idx == -1: missing_cal_cols.append("'Winning driver'/'Winner'/'Report'/'Results'")
            print(f"Não foi possível identificar as colunas { ' e '.join(missing_cal_cols) } na tabela do calendário.")
            corridas_restantes = None
    else:
        print("Tabela do calendário ('Grands Prix') não encontrada.")
        corridas_restantes = None

    if pilotos_data and corridas_restantes is not None:
        return pilotos_data, corridas_restantes
    else:
        if not pilotos_data: print("Falha ao obter dados dos pilotos.")
        if corridas_restantes is None: print("Falha ao obter número de corridas restantes.")
        print("Retornando None devido a dados incompletos do scraping.")
        return None, None


def obter_dados_pilotos_json():
    """
    Coleta os dados dos pilotos a partir de uma string JSON fornecida pelo usuário.
    Tenta "sanitizar" a entrada caso ela esteja duplamente encapada por aspas.
    """
    pilotos = []
    print("\n--- Entrada de Dados dos Pilotos via JSON ---")
    while True:
        json_string_original = input("Cole a string JSON com os dados dos pilotos (ou digite 'cancelar' para voltar): ")
        if json_string_original.lower() == 'cancelar':
            return None 

        if not json_string_original.strip():
            print("A string JSON não pode estar vazia. Tente novamente.")
            continue
        try:
            dados_decodificados_passo1 = json.loads(json_string_original)
            dados_finais_pilotos = None
            if isinstance(dados_decodificados_passo1, str):
                print("Detectado possível encapsulamento extra de aspas, tentando decodificação adicional...")
                try:
                    dados_finais_pilotos = json.loads(dados_decodificados_passo1)
                except json.JSONDecodeError as e_inner:
                    print(f"Erro ao decodificar a string JSON interna: {e_inner}")
                    print(f"String interna problemática: {dados_decodificados_passo1[:100]}...") 
                    continue 
            else:
                dados_finais_pilotos = dados_decodificados_passo1
            
            if not isinstance(dados_finais_pilotos, list):
                print("Formato JSON inválido. A estrutura principal deve ser uma lista (array) após o processamento. Ex: [{'nome': 'Piloto A', 'pontuacao': 100}]")
                if isinstance(dados_finais_pilotos, dict):
                    print("Dica: A estrutura recebida foi um dicionário (objeto), não uma lista. Verifique se a string JSON começa com '[' e termina com ']'.")
                continue

            pilotos_temp = []
            valido = True
            for item in dados_finais_pilotos: 
                if not isinstance(item, dict):
                    print(f"Formato JSON inválido. Cada item na lista deve ser um dicionário (objeto). Item problemático: {item}")
                    valido = False; break
                if "nome" not in item or not isinstance(item["nome"], str) or not item["nome"].strip():
                    print(f"Formato JSON inválido. Cada piloto deve ter uma chave 'nome' (string não vazia). Item problemático: {item}")
                    valido = False; break
                if "pontuacao" not in item or not isinstance(item["pontuacao"], int) or item["pontuacao"] < 0:
                    print(f"Formato JSON inválido. Cada piloto deve ter uma chave 'pontuacao' (inteiro não negativo). Item problemático: {item}")
                    valido = False; break
                pilotos_temp.append({"nome": item["nome"], "pontuacao_total": item["pontuacao"], "vitorias_simulacao": 0})
            
            if not valido: continue
            if not pilotos_temp:
                print("A lista de pilotos no JSON está vazia. Por favor, forneça pelo menos um piloto.")
                continue
            return pilotos_temp
        except json.JSONDecodeError as e_outer:
            print(f"Erro ao decodificar a string JSON inicial: {e_outer}")
            print("Verifique a sintaxe da string JSON colada, incluindo aspas e vírgulas.")
        except Exception as e: 
            print(f"Ocorreu um erro inesperado ao processar o JSON: {e}")
    
def obter_dados_pilotos_manual():
    pilotos = []
    print("\n--- Entrada de Dados dos Pilotos Manualmente ---")
    while True:
        nome = input("Nome do piloto (ou digite 'fim' para terminar): ")
        if nome.lower() == 'fim':
            if not pilotos: print("Nenhum piloto inserido. Por favor, insira pelo menos um piloto."); continue 
            break
        if not nome.strip(): print("Nome do piloto não pode ser vazio."); continue
        while True:
            try:
                pontuacao_str = input(f"Pontuação atual de {nome}: ")
                pontuacao = int(pontuacao_str)
                if pontuacao < 0: print("A pontuação não pode ser negativa. Tente novamente."); continue
                break
            except ValueError: print("Entrada inválida. Por favor, insira um número inteiro para a pontuação.")
        pilotos.append({"nome": nome, "pontuacao_total": pontuacao, "vitorias_simulacao": 0})
    return pilotos

def obter_dados_pilotos():
    """
    Permite ao usuário escolher entre entrada manual, JSON ou Wikipedia para os dados dos pilotos.
    Retorna (pilotos_data, num_corridas_restantes_override), onde num_corridas_restantes_override
    é o número de corridas obtido do scraping (ou None caso contrário).
    """
    while True:
        print("\n--- Método de Entrada de Dados dos Pilotos ---")
        metodo = input("Como você gostaria de inserir os dados dos pilotos? (manual / json / wikipedia): ").lower()
        if metodo == 'json':
            dados = obter_dados_pilotos_json()
            if dados: return dados, None 
        elif metodo == 'manual':
            dados = obter_dados_pilotos_manual()
            if dados: return dados, None
        elif metodo == 'wikipedia':
            print("Tentando obter dados da Wikipedia...")
            dados, num_corridas_calc = obter_dados_pilotos_e_corridas_wikipedia()
            if dados and num_corridas_calc is not None: 
                return dados, num_corridas_calc 
            else:
                print("Falha ao obter dados da Wikipedia. Verifique sua conexão ou tente outro método.")
        else:
            print("Opção inválida. Por favor, digite 'manual', 'json' ou 'wikipedia'.")


def obter_numero_corridas_restantes_usuario():
    """
    Coleta o número de corridas restantes no campeonato do usuário.
    Usado quando os dados não são obtidos da Wikipedia.
    """
    while True:
        try:
            num_corridas_str = input("Quantas corridas faltam no campeonato? ")
            num_corridas = int(num_corridas_str)
            if num_corridas < 0: 
                print("O número de corridas não pode ser negativo. Tente novamente.")
                continue
            return num_corridas
        except ValueError:
            print("Entrada inválida. Por favor, insira um número inteiro.")

# --- Funções de Simulação ---

def simular_corrida(pilotos_participantes):
    if not pilotos_participantes: return {}
    ordem_chegada = copy.deepcopy(pilotos_participantes)
    random.shuffle(ordem_chegada)
    pontos_corrida = {piloto["nome"]: 0 for piloto in pilotos_participantes}
    for i in range(min(len(ordem_chegada), len(PONTOS_F1))):
        piloto_vencedor = ordem_chegada[i]
        pontos_corrida[piloto_vencedor["nome"]] += PONTOS_F1[i]
    return pontos_corrida

def simular_temporada(pilotos_iniciais, num_corridas_restantes):
    pilotos_temporada = copy.deepcopy(pilotos_iniciais) 
    for _ in range(num_corridas_restantes):
        nomes_pilotos_para_corrida = [{"nome": p["nome"]} for p in pilotos_temporada]
        pontos_da_corrida_atual = simular_corrida(nomes_pilotos_para_corrida)
        for piloto in pilotos_temporada:
            piloto["pontuacao_total"] += pontos_da_corrida_atual.get(piloto["nome"], 0)
    return pilotos_temporada

def executar_simulacao_monte_carlo(pilotos_originais, num_corridas_restantes, num_total_simulacoes):
    if not pilotos_originais: print("Nenhum piloto para simular."); return {}
    contagem_campeonatos = {piloto["nome"]: 0 for piloto in pilotos_originais}
    print(f"\nExecutando {num_total_simulacoes} simulações...")
    for i in range(num_total_simulacoes):
        pilotos_para_simulacao_atual = copy.deepcopy(pilotos_originais)
        for p_orig, p_sim in zip(pilotos_originais, pilotos_para_simulacao_atual):
            p_sim["pontuacao_total"] = p_orig["pontuacao_total"]
        resultado_temporada = simular_temporada(pilotos_para_simulacao_atual, num_corridas_restantes)
        if not resultado_temporada: continue
        max_pontos = -1
        for piloto in resultado_temporada:
            if piloto["pontuacao_total"] > max_pontos: max_pontos = piloto["pontuacao_total"]
        campeoes_desta_simulacao = [p["nome"] for p in resultado_temporada if p["pontuacao_total"] == max_pontos]
        for campeao_nome in campeoes_desta_simulacao:
            if campeao_nome in contagem_campeonatos: contagem_campeonatos[campeao_nome] += 1
        if (i + 1) % (num_total_simulacoes // 20 if num_total_simulacoes >= 20 else 1) == 0:
            print(f"Progresso: {(i + 1) / num_total_simulacoes * 100:.0f}% concluído")
    return {nome: (vitorias / num_total_simulacoes) * 100 for nome, vitorias in contagem_campeonatos.items()}

# --- Função de Impressão de Resultados ---

def imprimir_resultados_tabela(probabilidades_campeonato, num_corridas_info, timestamp_simulacao):
    """
    Imprime as probabilidades do campeonato em formato de tabela,
    incluindo número de corridas restantes e timestamp.
    """
    print("\n--- Probabilidades Estimadas para o Campeonato ---")
    print(f"Simulação realizada em: {timestamp_simulacao}")
    print(f"Corridas consideradas restantes: {num_corridas_info}")
    
    if not probabilidades_campeonato:
        print("Não foi possível calcular as probabilidades.")
        return

    resultados_ordenados = sorted(probabilidades_campeonato.items(), key=lambda item: item[1], reverse=True)
    header_piloto, header_chance = "Piloto", "Chance (%)"
    max_len_nome = len(header_piloto)
    if resultados_ordenados: max_len_nome = max(max_len_nome, max(len(nome) for nome, _ in resultados_ordenados))
    chance_col_width = len(header_chance) 

    print(f"+-{'-' * max_len_nome}-+-{'-' * chance_col_width}-+")
    print(f"| {header_piloto.ljust(max_len_nome)} | {header_chance.ljust(chance_col_width)} |")
    print(f"+-{'-' * max_len_nome}-+-{'-' * chance_col_width}-+")
    for nome, prob in resultados_ordenados:
        prob_str = f"{prob:.2f}"
        print(f"| {nome.ljust(max_len_nome)} | {prob_str.rjust(chance_col_width)} |")
    print(f"+-{'-' * max_len_nome}-+-{'-' * chance_col_width}-+")

# --- Função Principal ---

def main():
    print("--- Simulador de Campeonato F1 2025 (Monte Carlo) ---")
    print("AVISO: Para a opção 'wikipedia', certifique-se de ter as bibliotecas 'requests' e 'beautifulsoup4' instaladas.")
    print("(pip install requests beautifulsoup4)")
    
    pilotos_data, num_corridas_override = obter_dados_pilotos() 
    
    if not pilotos_data: 
        print("Nenhum piloto foi inserido ou a entrada foi cancelada. Encerrando o programa.")
        return

    if num_corridas_override is not None:
        num_corridas = num_corridas_override
    else:
        num_corridas = obter_numero_corridas_restantes_usuario()

    num_simulacoes = 10000 
    timestamp_atual = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print("\n--- Dados Iniciais ---")
    if pilotos_data: 
        for piloto in pilotos_data:
            print(f"{piloto['nome']}: {piloto['pontuacao_total']} pontos")
    print(f"Corridas restantes para simulação: {num_corridas}") 
    print(f"Número de simulações: {num_simulacoes}")

    probabilidades_campeonato = executar_simulacao_monte_carlo(pilotos_data, num_corridas, num_simulacoes)
    imprimir_resultados_tabela(probabilidades_campeonato, num_corridas, timestamp_atual)

if __name__ == "__main__":
    main()
