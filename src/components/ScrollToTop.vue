<template>
  <transition name="slide-fade">
    <v-btn
      v-show="isVisible"
      icon="mdi-chevron-up"
      color="green-darken-3"
      size="large"
      elevation="6"
      class="scroll-to-top-btn"
      @click="scrollToTop"
      aria-label="Scroll to top"
    />
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const isVisible = ref(false);

const checkScroll = () => {
  isVisible.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  window.addEventListener("scroll", checkScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScroll);
});
</script>

<style scoped>
.scroll-to-top-btn {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 99;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s !important;
}

.scroll-to-top-btn:hover {
  transform: scale(1.1) !important;
}

.scroll-to-top-btn:active {
  transform: scale(0.95) !important;
}

/* Custom Slide + Fade Transition */
.slide-fade-enter-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease !important;
}

.slide-fade-leave-active {
  transition: transform 0.3s cubic-bezier(0.7, 0, 0.84, 0), opacity 0.3s ease !important;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100px) scale(0.5) !important;
  opacity: 0;
}
</style>
