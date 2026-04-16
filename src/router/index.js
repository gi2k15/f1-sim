import { createRouter, createWebHistory } from "vue-router";

import Home from "@/pages/Home.vue";
import FAQ from "@/pages/FAQ.vue";
import Coffee from "@/pages/Coffee.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/faq", component: FAQ },
  { path: "/cafe", component: Coffee },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
