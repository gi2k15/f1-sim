import random
import copy
import json # Adicionado para manipulação de JSON

# Sistema de pontuação da F1 (Top 10)
PONTOS_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
# PONTO_VOLTA_RAPIDA foi removido

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
            return None # Indica que o usuário cancelou

        if not json_string_original.strip():
            print("A string JSON não pode estar vazia. Tente novamente.")
            continue

        try:
            # Primeira tentativa de decodificação
            dados_decodificados_passo1 = json.loads(json_string_original)
            
            dados_finais_pilotos = None

            if isinstance(dados_decodificados_passo1, str):
                # Se o resultado da primeira decodificação for uma string,
                # isso indica que a string original provavelmente estava "envelopada"
                # por um par extra de aspas. Tentamos decodificar essa string interna.
                print("Detectado possível encapsulamento extra de aspas, tentando decodificação adicional...")
                try:
                    dados_finais_pilotos = json.loads(dados_decodificados_passo1)
                except json.JSONDecodeError as e_inner:
                    print(f"Erro ao decodificar a string JSON interna: {e_inner}")
                    print(f"String interna problemática: {dados_decodificados_passo1[:100]}...") # Mostra parte da string
                    continue # Volta para o início do loop while
            else:
                # Se a primeira decodificação não resultou em string, usamos o resultado diretamente.
                dados_finais_pilotos = dados_decodificados_passo1
            
            # Agora, dados_finais_pilotos deve conter a estrutura de dados Python (espera-se uma lista)
            if not isinstance(dados_finais_pilotos, list):
                print("Formato JSON inválido. A estrutura principal deve ser uma lista (array) após o processamento. Ex: [{'nome': 'Piloto A', 'pontuacao': 100}]")
                if isinstance(dados_finais_pilotos, dict):
                    print("Dica: A estrutura recebida foi um dicionário (objeto), não uma lista. Verifique se a string JSON começa com '[' e termina com ']'.")
                continue

            pilotos_temp = []
            valido = True
            for item in dados_finais_pilotos: # Usar dados_finais_pilotos aqui
                if not isinstance(item, dict):
                    print(f"Formato JSON inválido. Cada item na lista deve ser um dicionário (objeto). Item problemático: {item}")
                    valido = False
                    break
                if "nome" not in item or not isinstance(item["nome"], str) or not item["nome"].strip():
                    print(f"Formato JSON inválido. Cada piloto deve ter uma chave 'nome' (string não vazia). Item problemático: {item}")
                    valido = False
                    break
                if "pontuacao" not in item or not isinstance(item["pontuacao"], int) or item["pontuacao"] < 0:
                    print(f"Formato JSON inválido. Cada piloto deve ter uma chave 'pontuacao' (inteiro não negativo). Item problemático: {item}")
                    valido = False
                    break
                pilotos_temp.append({"nome": item["nome"], "pontuacao_total": item["pontuacao"], "vitorias_simulacao": 0})
            
            if not valido:
                continue

            if not pilotos_temp:
                print("A lista de pilotos no JSON está vazia. Por favor, forneça pelo menos um piloto.")
                continue

            return pilotos_temp # Retorna a lista de pilotos processada

        except json.JSONDecodeError as e_outer:
            print(f"Erro ao decodificar a string JSON inicial: {e_outer}")
            print("Verifique a sintaxe da string JSON colada, incluindo aspas e vírgulas.")
        except Exception as e: # Captura outras exceções inesperadas
            print(f"Ocorreu um erro inesperado ao processar o JSON: {e}")
    
def obter_dados_pilotos_manual():
    """
    Coleta os nomes dos pilotos e suas pontuações atuais do usuário manualmente.
    """
    pilotos = []
    print("\n--- Entrada de Dados dos Pilotos Manualmente ---")
    while True:
        nome = input("Nome do piloto (ou digite 'fim' para terminar): ")
        if nome.lower() == 'fim':
            if not pilotos:
                print("Nenhum piloto inserido. Por favor, insira pelo menos um piloto.")
                continue 
            break
        if not nome.strip():
            print("Nome do piloto não pode ser vazio.")
            continue
            
        while True:
            try:
                pontuacao_str = input(f"Pontuação atual de {nome}: ")
                pontuacao = int(pontuacao_str)
                if pontuacao < 0:
                    print("A pontuação não pode ser negativa. Tente novamente.")
                    continue
                break
            except ValueError:
                print("Entrada inválida. Por favor, insira um número inteiro para a pontuação.")
        
        pilotos.append({"nome": nome, "pontuacao_total": pontuacao, "vitorias_simulacao": 0})
    return pilotos

def obter_dados_pilotos():
    """
    Permite ao usuário escolher entre entrada manual ou JSON para os dados dos pilotos.
    """
    while True:
        print("\n--- Método de Entrada de Dados dos Pilotos ---")
        metodo = input("Como você gostaria de inserir os dados dos pilotos? (manual / json): ").lower()
        if metodo == 'json':
            dados_pilotos = obter_dados_pilotos_json()
            if dados_pilotos is not None: 
                return dados_pilotos
        elif metodo == 'manual':
            return obter_dados_pilotos_manual()
        else:
            print("Opção inválida. Por favor, digite 'manual' ou 'json'.")


def obter_numero_corridas_restantes():
    """
    Coleta o número de corridas restantes no campeonato.
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

# A função obter_numero_simulacoes() foi removida, pois o valor será fixo.

def simular_corrida(pilotos_participantes):
    """
    Simula uma única corrida e retorna os pontos ganhos por cada piloto na corrida.
    Assume que todos os pilotos têm chances iguais em cada corrida (simplificação).
    O ponto de volta mais rápida foi removido.
    """
    if not pilotos_participantes:
        return {}

    ordem_chegada = copy.deepcopy(pilotos_participantes)
    random.shuffle(ordem_chegada)

    pontos_corrida = {piloto["nome"]: 0 for piloto in pilotos_participantes}

    # Distribui pontos para o top 10 (ou menos, se houver menos pilotos)
    for i in range(min(len(ordem_chegada), len(PONTOS_F1))):
        piloto_vencedor = ordem_chegada[i]
        pontos_corrida[piloto_vencedor["nome"]] += PONTOS_F1[i]

    # A lógica para o ponto de volta mais rápida foi removida daqui.
            
    return pontos_corrida

def simular_temporada(pilotos_iniciais, num_corridas_restantes):
    """
    Simula o restante da temporada.
    Retorna o estado final dos pilotos (com pontuações atualizadas) para esta simulação.
    """
    pilotos_temporada = copy.deepcopy(pilotos_iniciais) 

    for _ in range(num_corridas_restantes):
        nomes_pilotos_para_corrida = [{"nome": p["nome"]} for p in pilotos_temporada]
        pontos_da_corrida_atual = simular_corrida(nomes_pilotos_para_corrida)
        
        for piloto in pilotos_temporada:
            piloto["pontuacao_total"] += pontos_da_corrida_atual.get(piloto["nome"], 0)
            
    return pilotos_temporada

def executar_simulacao_monte_carlo(pilotos_originais, num_corridas_restantes, num_total_simulacoes):
    """
    Executa a simulação de Monte Carlo completa.
    """
    if not pilotos_originais:
        print("Nenhum piloto para simular.")
        return {}

    contagem_campeonatos = {piloto["nome"]: 0 for piloto in pilotos_originais}

    print(f"\nExecutando {num_total_simulacoes} simulações...")
    for i in range(num_total_simulacoes):
        pilotos_para_simulacao_atual = copy.deepcopy(pilotos_originais)
        
        for p_orig, p_sim in zip(pilotos_originais, pilotos_para_simulacao_atual):
            p_sim["pontuacao_total"] = p_orig["pontuacao_total"]


        resultado_temporada = simular_temporada(pilotos_para_simulacao_atual, num_corridas_restantes)
        
        if not resultado_temporada: 
            continue

        max_pontos = -1
        for piloto in resultado_temporada:
            if piloto["pontuacao_total"] > max_pontos:
                max_pontos = piloto["pontuacao_total"]
        
        campeoes_desta_simulacao = [
            piloto["nome"] for piloto in resultado_temporada if piloto["pontuacao_total"] == max_pontos
        ]
        
        for campeao_nome in campeoes_desta_simulacao:
            if campeao_nome in contagem_campeonatos:
                 contagem_campeonatos[campeao_nome] += 1
        
        # Ajuste na frequência de impressão do progresso para 10000 simulações
        if (i + 1) % (num_total_simulacoes // 20 if num_total_simulacoes >= 20 else 1) == 0: # Imprime 20x
            print(f"Progresso: {(i + 1) / num_total_simulacoes * 100:.0f}% concluído")

    probabilidades = {
        nome: (vitorias / num_total_simulacoes) * 100 
        for nome, vitorias in contagem_campeonatos.items()
    }
    return probabilidades

def imprimir_resultados_tabela(probabilidades_campeonato, num_corridas):
    """
    Imprime as probabilidades do campeonato em formato de tabela.
    """
    print("\n--- Probabilidades Estimadas para o Campeonato ---")
    print(f"---           Corridas restantes: {num_corridas}           ---")
    if not probabilidades_campeonato:
        print("Não foi possível calcular as probabilidades.")
        return

    resultados_ordenados = sorted(probabilidades_campeonato.items(), key=lambda item: item[1], reverse=True)

    header_piloto = "Piloto"
    header_chance = "Chance (%)"

    # Determinar a largura da coluna de nome do piloto
    # Inclui o comprimento do cabeçalho e dos nomes dos pilotos
    max_len_nome = len(header_piloto)
    if resultados_ordenados:
        max_len_nome = max(max_len_nome, max(len(nome) for nome, _ in resultados_ordenados))
    
    # Largura da coluna de chance (fixa para acomodar "XXX.XX")
    # O cabeçalho "Chance (%)" tem 10 caracteres. "100.00" tem 6.
    # Usaremos um valor que acomode bem o cabeçalho e os números.
    chance_col_width = len(header_chance) 

    # Linha de topo da tabela
    print(f"+-{'-' * max_len_nome}-+-{'-' * chance_col_width}-+")
    # Cabeçalho
    print(f"| {header_piloto.ljust(max_len_nome)} | {header_chance.ljust(chance_col_width)} |")
    # Linha separadora
    print(f"+-{'-' * max_len_nome}-+-{'-' * chance_col_width}-+")

    # Dados da tabela
    for nome, prob in resultados_ordenados:
        prob_str = f"{prob:.2f}" # Formata a probabilidade com 2 casas decimais
        print(f"| {nome.ljust(max_len_nome)} | {prob_str.rjust(chance_col_width)} |")

    # Linha de rodapé da tabela
    print(f"+-{'-' * max_len_nome}-+-{'-' * chance_col_width}-+")


def main():
    """
    Função principal para executar o simulador.
    """
    print("--- Simulador de Campeonato F1 2025 (Monte Carlo) ---")
    
    pilotos_data = obter_dados_pilotos() 
    if not pilotos_data: 
        print("Nenhum piloto foi inserido ou a entrada foi cancelada. Encerrando o programa.")
        return

    num_corridas = obter_numero_corridas_restantes()
    num_simulacoes = 10000 # Número de simulações fixado em 10000

    print("\n--- Dados Iniciais ---")
    for piloto in pilotos_data:
        print(f"{piloto['nome']}: {piloto['pontuacao_total']} pontos")
    print(f"Corridas restantes: {num_corridas}")
    print(f"Número de simulações: {num_simulacoes}") # Informa o número fixo de simulações

    probabilidades_campeonato = executar_simulacao_monte_carlo(pilotos_data, num_corridas, num_simulacoes)

    imprimir_resultados_tabela(probabilidades_campeonato, num_corridas)


if __name__ == "__main__":
    main()
