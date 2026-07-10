<template>
  <section ref="scrollRef" class="ad-detail" @scroll.passive="onScroll">
    <header class="ad-detail-intro">
      <h1 class="ad-detail-component">{{ store.doc.value.component }}</h1>
      <p class="ad-detail-summary">{{ store.doc.value.description }}</p>
    </header>

    <template v-for="section in store.visibleSections.value" :key="section.kind">
      <h2 class="ad-detail-section">{{ section.label }}</h2>
      <ApiDetailItem v-for="node in section.nodes" :key="node.id" :node="node" />
    </template>

    <p v-if="!store.visibleSections.value.length" class="ad-empty">검색 결과가 없습니다.</p>
  </section>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import ApiDetailItem from './ApiDetailItem.vue';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const SPY_OFFSET = 60; // 스크롤 스파이 기준선(컨테이너 상단으로부터 px)

const store = useApiDocsStore();
const scrollRef = ref(null);

// 트리 클릭에 의한 부드러운 스크롤 동안에는 스파이를 멈춰서
// 지나치는 항목들이 순간적으로 하이라이트되는 것을 막는다.
let suppressSpy = false;
let suppressTimer = null;

const itemEl = (id) => scrollRef.value?.querySelector(`[data-node-id="${CSS.escape(id)}"]`);

// --- 트리 클릭 → 센터 스크롤 ------------------------------------------------
watch(
  () => store.scrollRequest.value,
  async (request) => {
    if (!request) return;
    await nextTick();
    const el = itemEl(request.id);
    const container = scrollRef.value;
    if (!el || !container) return;

    suppressSpy = true;
    clearTimeout(suppressTimer);
    container.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
    // 'scrollend' 미지원 브라우저를 위한 타임아웃 폴백
    suppressTimer = setTimeout(() => {
      suppressSpy = false;
    }, 800);
  },
);

// --- 센터 스크롤 → 트리 하이라이트(스크롤 스파이) ---------------------------
let spyTimer = null;
const onScroll = () => {
  if (suppressSpy || spyTimer) return;
  spyTimer = setTimeout(() => {
    spyTimer = null;
    const container = scrollRef.value;
    if (!container) return;

    const baseline = container.scrollTop + SPY_OFFSET;
    let currentId = null;
    const ids = store.orderedVisibleIds.value;
    for (let i = 0; i < ids.length; i++) {
      const el = itemEl(ids[i]);
      if (!el) continue;
      if (el.offsetTop <= baseline) {
        currentId = ids[i];
      } else {
        break;
      }
    }
    // 최상단(인트로 영역)에서는 첫 항목을 active 처리
    store.setActiveFromScroll(currentId || ids[0]);
  }, 80);
};

// 컴포넌트 전환 시 스크롤 위치 초기화
watch(
  () => store.currentKey.value,
  () => {
    scrollRef.value?.scrollTo({ top: 0 });
  },
);
</script>
