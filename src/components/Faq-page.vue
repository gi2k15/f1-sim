<template>
  <div class="faq-container">
    <h1>Perguntas Frequentes (FAQ)</h1>

    <div class="faq-item">
      <h2>O que é o Simulador de Campeonato F1?</h2>
      <p>
        Esta é uma ferramenta para simular o restante da temporada de Fórmula 1 e calcular as probabilidades de cada
        piloto se tornar campeão. Com base na pontuação atual, nos eventos restantes (Grandes Prêmios e Sprints) e em um
        modelo de simulação, o aplicativo projeta milhares de cenários para determinar as chances de título de cada
        competidor.
      </p>
    </div>

    <div class="faq-item">
      <h2>Como a simulação funciona?</h2>
      <p>O processo de simulação é baseado no <a href="https://pt.wikipedia.org/wiki/M%C3%A9todo_de_Monte_Carlo"
          target="_blank" rel="noopener noreferrer">Método de Monte Carlo</a> e segue estas etapas:</p>
      <ol>
        <li><strong>Carregamento de Dados:</strong> Ao clicar em "Importar pontuação", o simulador busca a classificação
          atual dos pilotos e a informação da última corrida diretamente de uma API pública de F1.</li>
        <li><strong>Configuração da Simulação:</strong> O aplicativo determina automaticamente o número de corridas e sprints
          restantes na temporada de 2025. Você pode ajustar esses números, bem como a pontuação dos pilotos e a
          quantidade de temporadas a serem simuladas (quanto mais, mais preciso o resultado).</li>
        <li><strong>Execução da Simulação:</strong> Para cada temporada simulada, o sistema embaralha aleatoriamente os
          pilotos para determinar os vencedores de cada corrida e sprint restante, distribuindo os pontos
          correspondentes.</li>
        <li><strong>Cálculo das Probabilidades:</strong> Ao final de todas as simulações, a ferramenta calcula a
          porcentagem de vezes que cada piloto terminou como campeão. Essa porcentagem representa a probabilidade de
          título.</li>
      </ol>
    </div>

    <div class="faq-item">
      <h2>Como os dados dos pilotos são carregados?</h2>
      <p>
        A maneira mais fácil e recomendada é clicar em <strong>"Importar pontuação"</strong>. Esta ação carrega
        automaticamente a classificação mais recente dos pilotos e as informações da última corrida a partir da API <a
          href="https://f1api.dev/" target="_blank" rel="noopener noreferrer">f1api.dev</a>.
      </p>
      <p>
        Após a importação, você tem total liberdade para <strong>editar manualmente a pontuação</strong> de qualquer
        piloto diretamente nos campos da tabela, permitindo testar cenários hipotéticos.
      </p>
    </div>

    <div class="faq-item">
      <h2>Como o número de corridas e sprints restantes é definido?</h2>
      <p>
        O aplicativo contém o calendário completo da temporada de 2025. Ele compara a data atual com as datas
        programadas para os eventos e calcula automaticamente quantas corridas e sprints ainda não aconteceram. Você
        pode ajustar esses valores manualmente se desejar simular cenários diferentes.
      </p>
    </div>

    <div class="faq-item">
      <h2>Qual sistema de pontuação é utilizado?</h2>
      <p>A simulação utiliza o sistema de pontuação oficial da FIA para a Fórmula 1:</p>
      <ul>
        <li><strong>Corridas Principais (Grand Prix):</strong> 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 pontos para os 10
          primeiros colocados.</li>
        <li><strong>Corridas Sprint:</strong> 8, 7, 6, 5, 4, 3, 2, 1 pontos para os 8 primeiros colocados.</li>
      </ul>
    </div>

    <div class="faq-item">
      <h2>Quantas simulações devo executar para ter um bom resultado?</h2>
      <p>
        Quanto maior o número de simulações, mais estatisticamente preciso será o resultado, pois cobre uma gama maior
        de resultados possíveis. O valor padrão de 10.000 oferece um bom equilíbrio entre velocidade e precisão.
        Aumentar este número (ex: para 100.000) pode refinar as probabilidades, mas exigirá mais tempo de processamento.
      </p>
    </div>

    <div class="faq-item">
      <h2>Os resultados são uma previsão garantida?</h2>
      <p>
        <strong>Não!</strong> É crucial entender que os resultados são probabilidades estatísticas baseadas em um modelo
        que assume que a vitória em cada corrida é um evento aleatório. Fatores do mundo real como quebras mecânicas,
        acidentes, atualizações de carros, condições climáticas e o desempenho variável dos pilotos não são
        considerados. Portanto, use esta ferramenta como um guia de probabilidades e para entretenimento, não como uma
        previsão definitiva.
      </p>
    </div>
  </div>
</template>

<style scoped>
.faq-container {
  width: 900px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
}

.faq-item {
  margin-bottom: 30px;
}

h2 {
  border-bottom: 2px solid white;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

p,
li {
  line-height: 1.6;
  color: #ccc;
  text-align: left;
}

ol,
ul {
  padding-left: 20px;
}

@media (max-width: 700px) {
  .faq-container {
    width: 90vw;
  }
}
</style>
