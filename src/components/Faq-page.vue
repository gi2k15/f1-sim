<template>
  <div class="faq-container">
    <h1>Perguntas Frequentes (FAQ)</h1>

    <div class="faq-item">
      <h2>O que é o F1 Sim?</h2>
      <p>O F1 Sim é uma ferramenta que permite simular o restante de uma temporada de Fórmula 1 para calcular as
        probabilidades de cada piloto se tornar campeão mundial. Com base nos pontos atuais, corridas restantes e um
        pouco de aleatoriedade, ele projeta milhares de cenários possíveis.</p>
    </div>

    <div class="faq-item">
      <h2>Como funciona a simulação?</h2>
      <p>A simulação ocorre em algumas etapas:</p>
      <ol>
        <li><strong>Importação de Dados:</strong> Você fornece os dados dos pilotos (nome e pontuação atual) em formato
          JSON.</li>
        <li><strong>Configuração:</strong> Você define o número de corridas e corridas sprint que ainda faltam na
          temporada, além do número de temporadas a serem simuladas.</li>
        <li><strong>Processamento:</strong> Para cada temporada simulada, o sistema distribui aleatoriamente as posições
          e pontos para cada corrida e sprint restantes. Em outras palavras, o sistema utiliza o <a
            href="https://pt.wikipedia.org/wiki/M%C3%A9todo_de_Monte_Carlo" target="_blank" noreferrer noopener>Método
            Monte Carlo</a>.</li>
        <li><strong>Resultado:</strong> Ao final, a ferramenta calcula a porcentagem de vezes que cada piloto terminou
          na primeira posição do campeonato, gerando a probabilidade de título para cada um.</li>
      </ol>
    </div>

    <div class="faq-item">
      <h2>Como obtenho os dados dos pilotos no formato JSON?</h2>
      <p>Você pode montar o seu próprio JSON seguindo o exemplo na página inicial. Para os dados mais recentes, você
        pode consultar o site oficial da Fórmula 1 ou outras fontes de notícias esportivas e transcrever os nomes e
        pontuações para o formato necessário.</p>
      <pre><code>[
  { "nome": "Max Verstappen", "pontuacao": 200 },
  { "nome": "Lewis Hamilton", "pontuacao": 180 }
]</code></pre>
      <p>Você também pode importar diretamente a classificação mais recente clicando no link correspondente. Só tenha em
        mente que os dados podem não estar totalmente atualizados, especialmente se importados no mesmo dia da última
        corrida.</p>
    </div>

    <div class="faq-item">
      <h2>Qual sistema de pontuação é utilizado?</h2>
      <p>A simulação utiliza o sistema de pontuação padrão da FIA para a Fórmula 1:</p>
      <ul>
        <li><strong>Corridas Principais:</strong> 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 pontos para os 10 primeiros
          colocados.</li>
        <li><strong>Corridas Sprint:</strong> 8, 7, 6, 5, 4, 3, 2, 1 pontos para os 8 primeiros colocados.</li>
      </ul>
    </div>

    <div class="faq-item">
      <h2>Quantas simulações devo executar?</h2>
      <p>Quanto mais simulações, mais estatisticamente precisos serão os resultados. O valor padrão de 10.000 é um bom
        ponto de partida, oferecendo um equilíbrio entre velocidade e precisão. Aumentar para 50.000 ou 100.000 pode
        refinar as probabilidades, mas levará mais tempo.</p>
    </div>

    <div class="faq-item">
      <h2>Os resultados são uma previsão garantida?</h2>
      <p><strong>Não.</strong> Os resultados são probabilidades estatísticas baseadas em um modelo aleatório. O
        automobilismo é imprevisível e fatores como quebras de carro, acidentes, desempenho do piloto no dia e até o
        clima não são (e não podem ser) simulados. Use esta ferramenta como um guia de probabilidades, não como uma
        certeza.</p>
    </div>
  </div>
</template>

<style scoped>
.faq-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #0a8d2b;
  /* Cor principal do tema */
}

.faq-item {
  margin-bottom: 30px;
}

h2 {
  color: #eee;
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

p,
li {
  line-height: 1.6;
  color: #ccc;
}

ol,
ul {
  padding-left: 20px;
}

pre {
  background-color: #181818;
  border: 1px solid #444;
  padding: 15px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

code {
  font-family: 'Courier New', Courier, monospace;
  color: #eee;
}
</style>
