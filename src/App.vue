<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title> Quem ganhará na Fórmula 1? </v-app-bar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row>
          <v-col>
            <p>Clique no botão abaixo para importar a pontuação atual.</p>
          </v-col>
        </v-row>
        <v-row>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title> Configurações </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-container>
                  <v-row>
                    <v-col>
                      <v-number-input
                        :min = 0
                        control-variant="split"
                        label="Número de corridas"
                      ></v-number-input>
                    </v-col>
                    <v-col>
                      <v-number-input
                        :min = 0
                        control-variant="split"
                        label="Número de sprints"
                      ></v-number-input>
                    </v-col>
                    <v-col>
                      <v-number-input
                        :min = 0
                        control-variant="split"
                        label="Número de simulações"
                      ></v-number-input>
                    </v-col>
                  </v-row>
                </v-container>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
        <v-row>
          <v-col class="text-center">
            <v-btn>Importar pontuação</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
