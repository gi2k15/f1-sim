<template>
  <v-container class="mt-10 fill-height">
    <v-row class="flex-column">
      <v-col
        ><div class="text-display-medium text-lg-display-large text-center">
          ☕ OBRIGADO! ☕
        </div></v-col
      >
      <v-col
        ><div class="text-headline-small text-grey text-center">
          Sua contribuição significa muito para mim!
        </div></v-col
      >
      <v-col class="mt-10">
        <v-sheet max-width="400px" class="pa-6 mx-auto" rounded border="md"
          ><v-row class="flex-column"
            ><v-col><div class="text-title-large text-center">PIX</div></v-col>
            <v-col><v-img src="/pix.jpg" height="200" /></v-col>
            <v-col
              ><v-text-field variant="outlined" readonly :value="key" />
            </v-col>
            <v-col class="d-flex justify-center"
              ><v-btn
                color="green-darken-3"
                size="large"
                rounded="xl"
                variant="flat"
                @click="copyKey"
                >Copiar e colar código PIX</v-btn
              ></v-col
            ></v-row
          ></v-sheet
        >
      </v-col>
    </v-row>
    <v-snackbar v-model="showSnackbar" color="green-darken-3">
      Código PIX copiado
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

const key =
  "00020126580014br.gov.bcb.pix01361ee4e9e4-56f6-4a8e-9b2f-974cbcdd48d75204000053039865802BR5915GENDOUIKARI20156009Sao Paulo610901227-20062220518daqr404664627038026304478A";
const showSnackbar = ref(false);

async function copyKey() {
  await navigator.clipboard.writeText(key);
  showSnackbar.value = true;
}
</script>
