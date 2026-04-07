import { createRouter, createWebHistory } from "vue-router";

import Home from "@/pages/Home.vue";
import FAQ from "@/pages/FAQ.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/faq", component: FAQ },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
