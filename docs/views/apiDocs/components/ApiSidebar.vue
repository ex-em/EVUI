<template>
  <aside class="ad-sidebar">
    <!-- 컴포넌트 선택 (기존 네비게이션과 동일한 카테고리 트리) -->
    <div class="ad-sidebar-head">
      <button class="ad-component-picker" @click="isPickerOpen = !isPickerOpen">
        <span class="ad-picker-current">
          {{ store.doc.value?.component || store.currentPage.value?.label }}
        </span>
        <span class="ad-picker-caret" :class="{ 'is-open': isPickerOpen }" />
      </button>

      <template v-if="isPickerOpen">
        <div class="ad-picker-backdrop" @click="isPickerOpen = false" />
        <div class="ad-picker-panel">
          <template v-for="group in store.componentTree" :key="group.category">
            <p class="ad-picker-category">{{ group.category }}</p>
            <button
              v-for="item in group.items"
              :key="item.key"
              class="ad-picker-item"
              :class="{ 'is-active': store.currentKey.value === item.key }"
              @click="pickComponent(item)"
            >
              {{ item.label }}
              <span v-if="!item.hasDoc" class="ad-picker-soon" title="기존 md 문서 표시">md</span>
            </button>
          </template>
        </div>
      </template>
    </div>

    <!-- Docs / Examples 탭 -->
    <div class="ad-tabs" role="tablist">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="ad-tab"
        :class="{ 'is-active': store.activeTab.value === tab.key }"
        role="tab"
        @click="changeTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Docs 탭 -->
    <template v-if="store.activeTab.value === 'docs'">
      <!-- md 폴백 컴포넌트: 트리 대신 안내 표시 -->
      <p v-if="!store.doc.value" class="ad-md-notice">
        아직 대화형 문서가 준비되지 않은 컴포넌트입니다.<br />
        기존 문서(md)를 표시합니다.
      </p>

      <template v-else>
        <div class="ad-search">
          <input
            v-model="store.query.value"
            class="ad-search-input"
            type="text"
            placeholder="속성명·설명 검색..."
            @keydown.esc="store.query.value = ''"
          />
          <button v-if="store.query.value" class="ad-search-clear" @click="store.query.value = ''">
            ✕
          </button>
        </div>

        <div class="ad-tree-scroll">
          <template v-for="section in store.sectionRoots.value" :key="section.kind">
            <p class="ad-tree-section">{{ section.label }}</p>
            <ul class="ad-tree">
              <ApiTreeNode
                v-for="rootId in section.rootIds"
                :key="rootId"
                :node="store.getNode(rootId)"
              />
            </ul>
          </template>
          <p v-if="!store.sectionRoots.value.length" class="ad-empty">검색 결과가 없습니다.</p>
        </div>
      </template>
    </template>

    <!-- Examples 탭: 관련 페이지별 실제 예제 목록 (클릭 시 센터 패널에 렌더링) -->
    <div v-else class="ad-examples">
      <template v-for="group in store.exampleGroups.value" :key="group.path">
        <p class="ad-tree-section">{{ group.label }}</p>
        <button
          v-for="item in group.items"
          :key="item.name"
          class="ad-example-link"
          :class="{ 'is-active': isExampleActive(group.path, item.name) }"
          @click="store.selectExample(group.path, item.name, group.label)"
        >
          <span class="ad-example-name">{{ item.name }}</span>
          <span v-if="item.description" class="ad-example-desc">{{ item.description }}</span>
        </button>
      </template>
      <p v-if="!store.exampleGroups.value.length" class="ad-empty">등록된 예제가 없습니다.</p>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import ApiTreeNode from './ApiTreeNode.vue';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const TABS = [
  { key: 'docs', label: 'Docs' },
  { key: 'examples', label: 'Examples' },
];

const store = useApiDocsStore();
const isPickerOpen = ref(false);

const pickComponent = (item) => {
  store.setComponent(item.key);
  isPickerOpen.value = false;
};

const changeTab = (key) => {
  store.activeTab.value = key;
  // Docs 탭으로 돌아오면 센터 패널도 API 문서로 복귀
  if (key === 'docs') {
    store.clearExample();
  }
};

const isExampleActive = (path, name) => {
  const selected = store.selectedExampleKey.value;
  return !!selected && selected.path === path && selected.name === name;
};
</script>
