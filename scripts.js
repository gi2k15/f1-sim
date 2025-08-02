const dataCorridas = [
    "2025-03-16", "2025-03-23", "2025-04-06", "2025-04-13", "2025-04-20", "2025-05-04", 
    "2025-05-18", "2025-05-25", "2025-06-01", "2025-06-15", "2025-06-29", "2025-07-06", 
    "2025-07-27", "2025-08-03", "2025-08-31", "2025-09-07", "2025-09-21", "2025-10-05", 
    "2025-10-19", "2025-10-26", "2025-11-09", "2025-11-22", "2025-11-30", "2025-12-07"
]

const dataSprints = [
    "2025-03-22", "2025-05-03", "2025-07-26", "2025-10-18", "2025-11-08", "2025-11-29"
]

const promptAI = `Monte uma tabela JSON com o nome dos pilotos, a nacionalidade no formato
ISO 3166-1 alpha 2 e a pontuação do piloto`
const standingsURL = "https://www.formula1.com/en/results/2025/drivers"

async function abrirClassificacao() {
    if (!promptAI || !standingsURL) {
        alert("Prompt ou página não definidos.")
        return
    } else {
        try {
            await navigator.clipboard.writeText(promptAI)
            window.open(standingsURL, "_blank", "noreferrer, noopener")
        } catch {
            alert("Não foi possível copiar o texto ou abrir a janela.")
        }
    }
}

function emojiBandeira(pais) {
    if (!pais || pais.length !== 2) return ''
    pais = pais.toLowerCase()
    const nomePais = (codigo, locale = 'pt-BR') => {
        const paisLocal = new Intl.DisplayNames([locale], { type: 'region' })
        return paisLocal.of(codigo.toUpperCase())
    }
    return `<span class="fi fi-${pais}" title="${nomePais(pais)}"></span>`
}

function extrairChave(obj, alternativas) {
    for (let alt of alternativas) {
        if (obj.hasOwnProperty(alt)) return obj[alt]
    }
    for (let k in obj) {
        if (typeof obj[k] === 'string' || typeof obj[k] === 'number') return obj[k]
    }
    return ''
}

function mostrarTabelaInicial(pilotos, corridas, sprints = 0) {
    let html = `<h3>Pontuação Inicial dos Pilotos</h3>`
    html += `<p>Corridas restantes: <b>${corridas}</b> | Sprints restantes: <b>${sprints}</b></p>`
    html += `<table><thead><tr><th>P</th><th>Piloto</th><th>Pontos</th></tr></thead><tbody>`
    pilotos.sort((a, b) => b.pontuacao - a.pontuacao)
        .forEach(p => {
            html += `<tr><td>${pilotos.indexOf(p) + 1}</td><td>${emojiBandeira(p.pais)} ${p.nome}</td><td>${p.pontuacao}</td></tr>`
        })
    html += `</tbody></table>`
    document.getElementById('tabela-inicial').innerHTML = html
}

function mostrarTabelaFinal(probabilidades, corridas, sprints = 0) {
    let html = `<h3>Estimativas</h3>`
    html += `<p>Corridas restantes: <b>${corridas}</b> | Sprints restantes: <b>${sprints}</b></p>`
    html += `<table><thead><tr><th>P</th><th>Piloto</th><th>Chance (%)</th></tr></thead><tbody>`
    probabilidades.sort((a, b) => b.chance - a.chance)
        .forEach(p => {
            html += `<tr><td>${probabilidades.indexOf(p) + 1}</td><td>${emojiBandeira(p.pais)} ${p.nome}</td><td>${p.chance.toFixed(2)}</td></tr>`
        })
    html += `</tbody></table>`
    document.getElementById('tabela-final').innerHTML = html
}

function simularCorrida(pilotos, tipo = 'normal') {
    let ordem = pilotos.slice()
    for (let i = ordem.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        [ordem[i], ordem[j]] = [ordem[j], ordem[i]]
    }
    let pontos
    if (tipo === 'sprint') {
        pontos = [8, 7, 6, 5, 4, 3, 2, 1]
    } else {
        pontos = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
    }
    let resultado = {}
    ordem.forEach((p, i) => {
        resultado[p.nome] = (resultado[p.nome] || 0) + (pontos[i] || 0)
    })
    return resultado
}

function simularTemporada(pilotos, corridas, sprints) {
    let temp = pilotos.map(p => ({ nome: p.nome, pontuacao: p.pontuacao }))
    for (let i = 0; i < corridas; i++) {
        let pontos = simularCorrida(temp, 'normal')
        temp.forEach(p => {
            p.pontuacao += pontos[p.nome] || 0
        })
    }
    for (let i = 0; i < sprints; i++) {
        let pontosSprint = simularCorrida(temp, 'sprint')
        temp.forEach(p => {
            p.pontuacao += pontosSprint[p.nome] || 0
        })
    }
    return temp
}

function simular(event) {
    event.preventDefault()
    let pilotos
    try {
        pilotos = JSON.parse(document.getElementById('pilotos_json').value)
    } catch {
        alert('JSON inválido!')
        return
    }
    if (!Array.isArray(pilotos) || pilotos.length === 0) {
        alert('Insira ao menos um piloto!')
        return
    }
    pilotos = pilotos.slice(0, 20)
    let corridas = parseInt(document.getElementById('corridas').value)
    let sprints = parseInt(document.getElementById('sprints').value)
    let simulacoes = parseInt(document.getElementById('simulacoes').value)
    pilotos = pilotos.map(p => ({
        nome: extrairChave(p, ['nome', 'piloto', 'driver', 'n']),
        pontuacao: parseInt(extrairChave(p, ['pontuacao', 'pontos', 'score', 'pts', 'p'])),
        pais: extrairChave(p, ['country', 'pais', 'nacionalidade'])
    }))
    mostrarTabelaInicial(pilotos, corridas, sprints)
    document.getElementById('tabela-final').innerHTML = ''
    let vitorias = {}
    for (let i = 0; i < simulacoes; i++) {
        let resultado = simularTemporada(pilotos, corridas, sprints)
        let max = Math.max(...resultado.map(p => p.pontuacao))
        resultado.filter(p => p.pontuacao === max).forEach(p => {
            vitorias[p.nome] = (vitorias[p.nome] || 0) + 1
        })
    }
    let probabilidades = pilotos.map(p => ({
        nome: p.nome,
        pais: p.pais,
        chance: (vitorias[p.nome] || 0) / simulacoes * 100
    }))
    mostrarTabelaFinal(probabilidades, corridas, sprints)
    document.getElementById('accordion').style.display = 'none'
    document.getElementById('resultados').style.display = 'block'
}

function exibirAccordion() {
    const acc = document.getElementById('accordion')
    acc.style.display = acc.style.display === 'none'
        ? 'block'
        : 'none'
}

function contarDatasFuturas(datas) {
    const agora = new Date()
    return datas.filter(dataStr => {
        const data = new Date(dataStr)
        return data > agora
    }).length
}

document.getElementById('corridas').value = contarDatasFuturas(dataCorridas)
document.getElementById('sprints').value = contarDatasFuturas(dataSprints)
