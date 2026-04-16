<template>
  <v-footer
    :height="60"
    class="footer-bar d-flex justify-center align-center ga-3"
  >
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
  </v-footer>
</template>

<style scoped>
.footer-bar {
  height: 60px !important;
  min-height: 60px !important;
  max-height: 60px !important;
}
</style>
