<template>
  <v-footer
    class="footer-bar d-flex flex-column justify-center align-center ga-3"
  >
    <div class="d-flex ga-3">
      <v-btn
        icon="mdi-github"
        v-tooltip:top="'GitHub'"
        href="https://github.com/gi2k15/f1-sim"
        target="_blank"
      />
      <v-btn
        icon="mdi-license"
        v-tooltip:top="'Licença'"
        href="https://www.gnu.org/licenses/lgpl-3.0.html"
        target="_blank"
      >
      </v-btn>
    </div>
    <v-divider thickness="1" width="50px" class="my-2"> </v-divider>
    <div
      class="text-body-small text-center font-weight-regular opacity-60 w-75"
    >
      Este é um projeto independente, não oficial e sem afiliação, endosso ou
      patrocínio da Formula One Management, Formula One Licensing BV, FIA,
      equipes, pilotos ou demais entidades relacionadas ao Campeonato Mundial de
      Fórmula 1. Fórmula 1, F1, nomes de Grandes Prêmios, equipes, pilotos,
      marcas, logotipos e demais propriedades intelectuais mencionadas pertencem
      aos seus respectivos titulares. Todos os direitos autorais, marcas
      registradas e direitos relacionados são reservados aos seus proprietários.
    </div>
  </v-footer>
</template>

<style scoped>
/* .footer-bar {
  height: 200px !important;
  min-height: 200px !important;
  max-height: 200px !important;
} */
</style>
