<template>
  <v-container class="pt-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">FAQ</h1>
        <p class="text-body-large text-medium-emphasis">
          Perguntas frequentes sobre como a simulação funciona, os recursos
          disponíveis e de onde vêm os dados.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              O que este projeto faz?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              Ele estima a probabilidade de cada piloto conquistar o título
              mundial de Fórmula 1 ao final da temporada, utilizando o
              <a
                href="https://pt.wikipedia.org/wiki/M%C3%A9todo_de_Monte_Carlo"
                target="_blank"
                noreferrer
                noopener
                >método de Monte Carlo</a
              >
              para simular milhares de finais alternativos de campeonato em
              segundo plano (via Web Workers). Além disso, disponibiliza um
              gráfico de linha interativo que traça o histórico dessa
              probabilidade a cada etapa disputada.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              Como funciona a aba de Evolução do Campeonato?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              Na aba <strong>Evolução</strong>, o simulador reconstitui a
              pontuação e os eventos restantes em cada Grande Prêmio já
              disputado da temporada (desde a largada inicial até a etapa mais
              recente) e roda simulações de Monte Carlo para cada rodada. O
              gráfico de linha exibe visualmente como as chances de cada piloto
              subiram ou caíram ao longo do ano. Você pode usar os filtros
              rápidos (Top 3, Top 5, Top 10 ou Todos) ou clicar nos chips
              coloridos de cada piloto para personalizar a visualização.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              O que é a coluna "Evolução vs Etapa Anterior" na tabela?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              Essa coluna mostra a variação percentual da chance de título do
              piloto na etapa atual em comparação direta com a probabilidade que
              ele tinha na etapa imediatamente anterior (última corrida). Um
              valor positivo com seta verde (▲) indica ganho de probabilidade
              após o resultado mais recente, enquanto um valor com seta vermelha
              (▼) indica queda.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              E se a API ainda não tiver atualizado os pontos após a última
              corrida?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              A API pública pode levar algumas horas ou dias para computar a
              pontuação oficial após a bandeirada. Para resolver isso:
              <ul class="pl-6 mt-2">
                <li>
                  O app detecta automaticamente quando uma corrida já ocorreu e
                  avisa através de um alerta se os pontos da API ainda forem os
                  da etapa anterior.
                </li>
                <li>
                  <strong>Você pode editar manualmente a pontuação</strong>:
                  basta clicar no chip de pontos de qualquer piloto no card da
                  página inicial, definir os novos pontos (ou somar pontuações
                  padrão da F1 como +25, +18, etc.) e clicar em
                  <strong>Simular</strong> para atualizar o cálculo
                  imediatamente.
                </li>
                <li>
                  A qualquer momento é possível restaurar os pontos originais da
                  API com um clique.
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              De onde vêm os dados e como funciona o cache?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              Os dados são obtidos da API pública <code>f1api.dev</code>
              (classificação oficial, pilotos, equipes e calendário de 2026).
              <ul class="pl-6 mt-2">
                <li>
                  O número de corridas e sprints restantes é calculado
                  automaticamente a partir das datas do calendário oficial,
                  podendo também ser ajustado livremente nas configurações.
                </li>
                <li>
                  Para garantir carregamento instantâneo e evitar limites de
                  requisição, os resultados das simulações e históricos são
                  armazenados em cache local no seu próprio navegador
                  (<code>localStorage</code>).
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              O que significam as configurações de simulação?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <ul class="pl-6">
                <li>
                  <strong>Corridas restantes</strong>: quantas etapas principais
                  ainda serão simuladas até o fim da temporada.
                </li>
                <li>
                  <strong>Sprints restantes</strong>: quantas corridas sprint
                  ainda serão disputadas.
                </li>
                <li>
                  <strong>Número de simulações</strong>: quantidade de
                  temporadas alternativas geradas pelo algoritmo de Monte Carlo.
                  Quanto maior o valor (por exemplo, 100.000), mais
                  estatisticamente estável é o resultado.
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              Como funciona o desempate em caso de igualdade de pontos?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              Se dois ou mais pilotos terminarem empatados em pontos ao final de
              uma temporada simulada, o algoritmo aplica o critério oficial de
              desempate da F1: é considerado campeão o piloto com o maior número
              de vitórias em Grandes Prêmios.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              O resultado é "preciso"?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              É uma estimativa probabilística simplificada, baseada em
              aleatoriedade combinatória a partir dos pontos atuais. O modelo
              não calcula variáveis complexas como ritmo puro de corrida,
              confiabilidade mecânica, penalidades, clima ou adequação de cada
              carro a cada traçado. Use como uma referência estatística
              divertida!
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              Como interpretar a "chance (%)"?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              A chance é a proporção de simulações em que o piloto terminou como
              campeão mundial, multiplicada por 100. Por exemplo:
              <code>23,50%</code> significa que, em 23.500 de 100.000
              campeonatos simulados, aquele piloto terminou em 1º lugar na
              classificação final.
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>
