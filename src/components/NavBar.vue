<template>
  <v-navigation-drawer temporary floating>
    <v-list nav>
      <v-list-item prepend-icon="mdi-home" title="Início" to="/" />
      <v-list-item
        prepend-icon="mdi-frequently-asked-questions"
        title="FAQ"
        to="/faq"
      />
      <v-list-item
        prepend-icon="mdi-coffee"
        title="Me compre um café"
        to="/cafe"
      >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
