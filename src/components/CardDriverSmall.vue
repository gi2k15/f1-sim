<template>
  <article class="f1-card-small" role="group" aria-label="Card pequeno do piloto">
    <div class="pos" :title="`Posição: ${position}`">{{ position }}</div>

    <div class="main">
      <div class="name" :title="name">{{ name }}</div>
      <div class="meta">
        <input type="number" v-model.lazy="points">
        <span class="points"> pts</span>
        <div v-if="props.probability" class="main" style="align-items: center;">
          <span class="prob" :title="formattedProbability">{{ formattedProbability }}</span>
          <span v-show="diffLeader !== 0" class="diff" title="Diferença para o anterior / Diferença para o líder">{{
            diffPrev }} <span style="color: greenyellow">{{ diffLeader }}</span></span>
        </div>
      </div>
      <div class="prob-bar" aria-hidden="true">
        <div class="fill" :style="{ width: Math.max(0, Math.min(100, Number(probability || 0))) + '%' }"></div>
      </div>
    </div>

    <div class="icons">
      <img v-if="teamIcon" class="team" :src="teamIcon" :title="teamName" />
      <span v-else class="team placeholder"></span>
      <span v-if="countryCode" :class="['fi', 'fi-' + countryCode.toLowerCase()]" class="flag"
        :title="countryName"></span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  position: { type: [Number, String], required: true },
  name: { type: String, required: true },
  diffLeader: { type: [Number, String], default: 0 },
  diffPrev: { type: [Number, String], default: 0 },
  probability: { type: [Number, String], default: 0 },
  teamIcon: { type: String, default: '' },
  teamName: { type: String, default: '' },
  countryCode: { type: String, default: '' },
  countryName: { type: String, default: '' }
})

const points = defineModel({
  type: [Number, String],
  default: 0
})

const formattedProbability = computed(() => {
  const p = Number(props.probability) || 0
  return `${Math.max(0, Math.min(100, p))}%`
})
</script>

<style scoped>
.f1-card-small {
  --f1-red: #e10600;
  --bg: #111;
  --card-bg: #0f0f0f;
  --text: #eaeaea;
  --muted: #9b9b9b;

  width: 300px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: var(--card-bg);
  color: var(--text);
  border-radius: 10px;
}

.pos {
  width: 46px;
  min-width: 46px;
  text-align: center;
  font-weight: 800;
  font-size: 1.6rem;
  color: var(--f1-red);
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name {
  font-weight: 700;
  font-size: 0.98rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--muted);
  font-size: 0.86rem;
}

.meta>input {
  width: 4rem;
}

.diff {
  font-size: 0.7rem;
  color: rgb(255, 71, 71);
  vertical-align: middle;
}

.prob-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 6px;
}

.prob-bar .fill {
  height: 100%;
  background: linear-gradient(90deg, #2ecc71, #e1ad01, #e10600);
  transition: width 600ms ease;
}

.icons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 56px;
}

.team {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  background: #fff;
}

.team.placeholder {
  width: 40px;
  height: 40px;
  background: linear-gradient(180deg, #222, #111);
  border-radius: 6px;
}

.flag {
  width: 28px;
  height: 20px;
  display: inline-block;
}

@media (max-width: 420px) {
  .f1-card-small {
    width: 100%;
  }

  .pos {
    font-size: 1.4rem;
    width: 42px;
  }

  .team {
    width: 36px;
    height: 36px;
  }
}
</style>
