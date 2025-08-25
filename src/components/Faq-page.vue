<template>
  <h1>FAQ</h1>
  <h2>O que é esta página?</h2>
  <p>Esta página é uma ferramenta para simular a probabilidade de cada piloto ganhar o campeonato mundial de Fórmula 1,
    com base nas pontuações atuais e no número de corridas restantes.</p>

  <h2>Como funciona a simulação?</h2>
  <p>A simulação funciona da seguinte forma:</p>
  <ol>
    <li>Você insere as pontuações atuais dos pilotos em formato JSON.</li>
    <li>Define o número de corridas e corridas sprint restantes na temporada.</li>
    <li>Define o número de simulações a serem executadas.</li>
    <li>Para cada simulação, o sistema simula o resultado de cada corrida restante, atribuindo pontos aleatoriamente aos
      pilotos.</li>
    <li>Ao final de todas as simulações, é calculada a porcentagem de vezes que cada piloto terminou como campeão.</li>
  </ol>

  <h2>De onde vêm os dados dos pilotos?</h2>
  <p>Os dados iniciais dos pilotos (nome, nacionalidade e pontuação) devem ser fornecidos por você em formato JSON. Há
    um exemplo de JSON disponível na página principal para você usar como base.</p>

  <h2>Posso ajustar o número de corridas e sprints restantes?</h2>
  <p>Sim, você pode ajustar o número de corridas e corridas sprint restantes na temporada para refletir o calendário
    atual da Fórmula 1.</p>

  <h2>Quantas simulações devo executar?</h2>
  <p>Quanto maior o número de simulações, mais precisos serão os resultados. No entanto, um número muito alto de
    simulações pode levar mais tempo para ser processado. O valor padrão é 10.000, que geralmente oferece um bom
    equilíbrio entre precisão e velocidade.</p>

  <h2>Os resultados são 100% precisos?</h2>
  <p>Não. Os resultados são baseados em simulações aleatórias e, portanto, representam probabilidades. Eles não garantem
    o resultado real do campeonato, pois o esporte é imprevisível e muitos fatores (desempenho real dos pilotos,
    condições climáticas, incidentes de corrida, etc.) não permitem que seja possível aferir com precisão o resultado.</p>
</template>
