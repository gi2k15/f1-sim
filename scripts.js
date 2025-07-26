/**
* Extrai o valor de uma chave alternativa de um objeto.
* @param {Object} obj - O objeto de onde extrair o valor.
* @param {string[]} alternativas - Lista de possíveis nomes de chave.
* @returns {string|number} O valor encontrado ou o primeiro valor string/number do objeto.
*
* Exemplo de uso:
*   let nome = extrairChave(piloto, ['nome', 'piloto', 'driver']);
*/
function extrairChave(obj, alternativas) {
    for (let alt of alternativas) {
        if (obj.hasOwnProperty(alt)) return obj[alt];
    }
    for (let k in obj) {
        if (typeof obj[k] === 'string' || typeof obj[k] === 'number') return obj[k];
    }
    return '';
}

/**
 * Gera e exibe a tabela inicial dos pilotos.
 * @param {Array} pilotos - Array de objetos de pilotos (com .nome e .pontuacao).
 * @param {number} corridas - Número de corridas restantes.
 *
 * Exemplo de uso:
 *   mostrarTabelaInicial(pilotos, 10);
 *
 * Espera que exista um elemento com id 'tabela-inicial' no HTML.
 */
function mostrarTabelaInicial(pilotos, corridas) {
    let html = `<h3>Pontuação Inicial dos Pilotos</h3>`;
    html += `<table><thead><tr><th>Piloto</th><th>Pontos</th></tr></thead><tbody>`;
    pilotos.sort((a, b) => b.pontuacao - a.pontuacao)
        .forEach(p => {
            html += `<tr><td>${p.nome}</td><td>${p.pontuacao}</td></tr>`;
        });
    html += `</tbody></table>`;
    document.getElementById('tabela-inicial').innerHTML = html;
}

/**
 * Gera e exibe a tabela final de probabilidades dos pilotos.
 * @param {Array} probabilidades - Array de objetos {nome, chance}.
 * @param {number} corridas - Número de corridas restantes.
 *
 * Exemplo de uso:
 *   mostrarTabelaFinal(probabilidades, 10);
 *
 * Espera que exista um elemento com id 'tabela-final' no HTML.
 */
function mostrarTabelaFinal(probabilidades, corridas) {
    let html = `<h3>Estimativas</h3>`;
    html += `<table><thead><tr><th>Piloto</th><th>Chance (%)</th></tr></thead><tbody>`;
    probabilidades.sort((a, b) => b.chance - a.chance)
        .forEach(p => {
            html += `<tr><td>${p.nome}</td><td>${p.chance.toFixed(2)}</td></tr>`;
        });
    html += `</tbody></table>`;
    document.getElementById('tabela-final').innerHTML = html;
}

/**
 * Simula uma corrida, embaralhando os pilotos e atribuindo pontos de acordo com a posição.
 * @param {Array} pilotos - Array de objetos de pilotos (com .nome).
 * @returns {Object} Um objeto {nome: pontos} com os pontos ganhos por cada piloto nesta corrida.
 *
 * Exemplo de uso:
 *   let pontos = simularCorrida(pilotos);
 */
function simularCorrida(pilotos) {
    let ordem = pilotos.slice();
    for (let i = ordem.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    }
    const pontosF1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    let pontos = {};
    ordem.forEach((p, i) => {
        pontos[p.nome] = (pontos[p.nome] || 0) + (pontosF1[i] || 0);
    });
    return pontos;
}

/**
 * Simula uma temporada completa, acumulando pontos dos pilotos.
 * @param {Array} pilotos - Array de objetos {nome, pontuacao}.
 * @param {number} corridas - Número de corridas a simular.
 * @returns {Array} Novo array de pilotos com pontuação final.
 *
 * Exemplo de uso:
 *   let resultado = simularTemporada(pilotos, 10);
 */
function simularTemporada(pilotos, corridas) {
    let temp = pilotos.map(p => ({ nome: p.nome, pontuacao: p.pontuacao }));
    for (let i = 0; i < corridas; i++) {
        let pontos = simularCorrida(temp);
        temp.forEach(p => {
            p.pontuacao += pontos[p.nome] || 0;
        });
    }
    return temp;
}

/**
 * Função principal para simular o campeonato.
 * Lê os dados do JSON, executa as simulações e exibe os resultados.
 *
 * Espera que existam elementos com ids:
 *   - 'pilotos_json' (textarea com o JSON dos pilotos)
 *   - 'corridas' (input number)
 *   - 'simulacoes' (input number)
 *   - 'tabela-inicial' (div para tabela inicial)
 *   - 'tabela-final' (div para tabela final)
 *
 * Exemplo de uso:
 *   simular();
 *
 * O JSON pode ter qualquer chave para nome/pontuação, pois é feita a extração automática.
 */
function simular(event) {
    event.preventDefault();
    let pilotos;
    try {
        pilotos = JSON.parse(document.getElementById('pilotos_json').value);
    } catch {
        alert('JSON inválido!');
        return;
    }
    if (!Array.isArray(pilotos) || pilotos.length === 0) {
        alert('Insira ao menos um piloto!');
        return;
    }
    let corridas = parseInt(document.getElementById('corridas').value);
    let simulacoes = parseInt(document.getElementById('simulacoes').value);
    // Aceita qualquer chave para nome e pontuacao
    pilotos = pilotos.map(p => ({
        nome: extrairChave(p, ['nome', 'piloto', 'driver', 'n']),
        pontuacao: parseInt(extrairChave(p, ['pontuacao', 'pontos', 'score', 'pts', 'p']))
    }));
    mostrarTabelaInicial(pilotos, corridas);
    document.getElementById('tabela-final').innerHTML = '';
    let vitorias = {};
    for (let i = 0; i < simulacoes; i++) {
        let resultado = simularTemporada(pilotos, corridas);
        let max = Math.max(...resultado.map(p => p.pontuacao));
        resultado.filter(p => p.pontuacao === max).forEach(p => {
            vitorias[p.nome] = (vitorias[p.nome] || 0) + 1;
        });
    }
    let probabilidades = pilotos.map(p => ({
        nome: p.nome,
        chance: (vitorias[p.nome] || 0) / simulacoes * 100
    }));
    mostrarTabelaFinal(probabilidades, corridas);
    document.getElementById('accordion').style.display = 'none';
    document.getElementById('resultados').style.display = 'block';
}

/**
 * Função que exibe ou oculta o accordion.
 */
function exibirAccordion() {
    const acc = document.getElementById('accordion')
    if (acc.style.display === 'none' || acc.style.display === '') {
        acc.style.display = 'block';
    } else {
        acc.style.display = 'none';
    }
}