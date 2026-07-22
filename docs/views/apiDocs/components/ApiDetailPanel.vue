<template>
  <section
    ref="scrollRef"
    class="apidoc-detail"
    :class="{ 'is-example': !!store.selectedExample.value }"
    @scroll.passive="onScroll"
  >
    <!-- 예제 뷰: Examples 탭에서 예제 선택 시 -->
    <template v-if="store.selectedExample.value">
      <header class="apidoc-detail-intro apidoc-example-intro">
        <div>
          <p class="apidoc-example-group">{{ store.selectedExample.value.label }}</p>
          <h1 class="apidoc-detail-component">{{ store.selectedExample.value.name }}</h1>
          <!-- 예제 설명은 props.js에서 HTML을 포함할 수 있어 v-html로 렌더링 (Example.vue와 동일) -->
          <p
            v-if="store.selectedExample.value.description"
            class="apidoc-detail-summary"
            v-html="store.selectedExample.value.description"
          />
        </div>
        <button class="apidoc-example-back" @click="store.clearExample()">← API 문서</button>
      </header>
      <Example
        :key="`${store.currentKey.value}_${store.selectedExample.value.name}`"
        :title="store.selectedExample.value.name"
        :description="store.selectedExample.value.description"
        :component="store.selectedExample.value.component"
        :parsed-data="store.selectedExample.value.parsedData"
      />
    </template>

    <!-- md 폴백 뷰: JSON 문서가 없는 컴포넌트는 기존 md를 렌더링 -->
    <template v-else-if="!store.doc.value">
      <header class="apidoc-detail-intro">
        <h1 class="apidoc-detail-component">{{ store.currentPage.value?.label }}</h1>
        <p class="apidoc-detail-summary">
          아직 대화형 문서가 준비되지 않아 기존 문서(md)를 표시합니다.
        </p>
      </header>
      <MarkdownView class="apidoc-md-fallback" :source="store.currentPage.value?.page?.mdText || ''" />
    </template>

    <!-- API 문서 뷰 -->
    <template v-else>
      <header class="apidoc-detail-intro">
        <h1 class="apidoc-detail-component">{{ store.doc.value.component }}</h1>
        <p class="apidoc-detail-summary">{{ store.doc.value.description }}</p>
      </header>

      <template v-for="section in store.visibleSections.value" :key="section.kind">
        <h2 class="apidoc-detail-section">{{ section.label }}</h2>
        <ApiDetailGroup
          v-for="block in section.blocks"
          :key="block.head.id"
          :head="block.head"
          :rows="block.rows"
        />
      </template>

      <p v-if="!store.visibleSections.value.length" class="apidoc-empty">검색 결과가 없습니다.</p>
    </template>
  </section>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import MarkdownView from 'docs/components/MarkdownView';
import ApiDetailGroup from './ApiDetailGroup.vue';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const SPY_OFFSET = 60; // 스크롤 스파이 기준선(컨테이너 상단으로부터 px)

const store = useApiDocsStore();
const scrollRef = ref(null);

// 트리 클릭에 의한 부드러운 스크롤 동안에는 스파이를 멈춰서
// 지나치는 항목들이 순간적으로 하이라이트되는 것을 막는다.
let suppressSpy = false;
let suppressTimer = null;

const itemEl = (id) => scrollRef.value?.querySelector(`[data-node-id="${CSS.escape(id)}"]`);

/**
 * 스크롤 콘텐츠 기준 요소의 top 좌표.
 * offsetTop은 content-visibility(contain: layout)로 카드가 offsetParent가 되는 등
 * 기준이 흔들릴 수 있어, 항상 rect 차이로 계산한다.
 */
const topInContent = (el, container) =>
  el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;

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
    container.scrollTo({ top: topInContent(el, container) - 12, behavior: 'smooth' });
    // 'scrollend' 미지원 브라우저를 위한 타임아웃 폴백
    suppressTimer = setTimeout(() => {
      // content-visibility 지연 렌더로 스크롤 중 위쪽 카드 높이가 바뀌면
      // 목표 위치가 어긋나 제목이 가려질 수 있어, 완료 시점에 한 번 보정한다.
      const target = itemEl(request.id);
      if (target) {
        const top = topInContent(target, container) - 12;
        if (Math.abs(container.scrollTop - top) > 4) {
          container.scrollTo({ top, behavior: 'instant' });
        }
      }
      suppressSpy = false;
    }, 800);
  },
);

// --- 센터 스크롤 → 트리 하이라이트(스크롤 스파이) ---------------------------
let spyTimer = null;
const onScroll = () => {
  // 예제 뷰에서는 문서 항목이 없으므로 스파이를 멈춘다
  if (store.selectedExample.value) return;
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
      if (topInContent(el, container) <= baseline) {
        currentId = ids[i];
      } else {
        break;
      }
    }
    // 최상단(인트로 영역)에서는 첫 항목을 active 처리
    store.setActiveFromScroll(currentId || ids[0]);
  }, 80);
};

// 컴포넌트/예제 전환 시 스크롤 위치 초기화
watch(
  [() => store.currentKey.value, () => store.selectedExampleKey.value],
  () => {
    scrollRef.value?.scrollTo({ top: 0 });
  },
);
</script>
