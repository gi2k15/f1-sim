<template>
  <v-container class="mt-10 fill-height">
    <v-row class="flex-column">
      <v-col
        ><div class="text-display-large text-center">
          ☕ OBRIGADO! 🥖
        </div></v-col
      >
      <v-col
        ><div class="text-headline-small text-grey text-center">
          Sua contribuição significa muito para mim!
        </div></v-col
      >
      <v-col class="mt-10">
        <v-sheet class="pa-4" rounded
          ><v-row class="flex-column"
            ><v-col><div class="text-title-large text-center">PIX</div></v-col>
            <v-col><v-img src="/pix.jpg" height="200" /></v-col>
            <v-col><v-text-field variant="outlined" /> </v-col>
            <v-col><v-btn>Copiar e colar</v-btn></v-col></v-row
          ></v-sheet
        >
      </v-col>
    </v-row>
  </v-container>
</template>
