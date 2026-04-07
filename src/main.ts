/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from "vue";

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "@/App.vue";

// Router
// @ts-ignore
import router from "./router/index.js";

// Styles
import "unfonts.css";

const app = createApp(App);

registerPlugins(app);

app.use(router);

app.mount("#app");
