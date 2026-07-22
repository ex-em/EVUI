<template>
  <aside class="apidoc-sidebar">
    <!-- 컴포넌트 선택 (기존 네비게이션과 동일한 카테고리 트리) -->
    <div class="apidoc-sidebar-head">
      <button class="apidoc-component-picker" @click="isPickerOpen = !isPickerOpen">
        <span class="apidoc-picker-current">
          {{ store.doc.value?.component || store.currentPage.value?.label }}
        </span>
        <span class="apidoc-picker-caret" :class="{ 'is-open': isPickerOpen }" />
      </button>

      <template v-if="isPickerOpen">
        <div class="apidoc-picker-backdrop" @click="isPickerOpen = false" />
        <div class="apidoc-picker-panel">
          <template v-for="group in store.componentTree" :key="group.category">
            <p class="apidoc-picker-category">{{ group.category }}</p>
            <button
              v-for="item in group.items"
              :key="item.key"
              class="apidoc-picker-item"
              :class="{ 'is-active': store.currentKey.value === item.key }"
              @click="pickComponent(item)"
            >
              {{ item.label }}
              <span v-if="!item.hasDoc" class="apidoc-picker-soon" title="기존 md 문서 표시">md</span>
            </button>
          </template>
        </div>
      </template>
    </div>

    <!-- Docs / Examples 탭 -->
    <div class="apidoc-tabs" role="tablist">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="apidoc-tab"
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
      <p v-if="!store.doc.value" class="apidoc-md-notice">
        아직 대화형 문서가 준비되지 않은 컴포넌트입니다.<br />
        기존 문서(md)를 표시합니다.
      </p>

      <template v-else>
        <div class="apidoc-search">
          <input
            v-model="store.query.value"
            class="apidoc-search-input"
            type="text"
            placeholder="속성명·설명 검색..."
            @keydown.esc="store.query.value = ''"
          />
          <button v-if="store.query.value" class="apidoc-search-clear" @click="store.query.value = ''">
            ✕
          </button>
        </div>

        <div class="apidoc-tree-scroll">
          <template v-for="section in store.sectionRoots.value" :key="section.kind">
            <p class="apidoc-tree-section">{{ section.label }}</p>
            <ul class="apidoc-tree">
              <ApiTreeNode
                v-for="rootId in section.rootIds"
                :key="rootId"
                :node="store.getNode(rootId)"
              />
            </ul>
          </template>
          <p v-if="!store.sectionRoots.value.length" class="apidoc-empty">검색 결과가 없습니다.</p>
        </div>
      </template>
    </template>

    <!-- Examples 탭: 관련 페이지별 실제 예제 목록 (클릭 시 센터 패널에 렌더링) -->
    <div v-else class="apidoc-examples">
      <template v-for="group in store.exampleGroups.value" :key="group.path">
        <p class="apidoc-tree-section">{{ group.label }}</p>
        <button
          v-for="item in group.items"
          :key="item.name"
          class="apidoc-example-link"
          :class="{ 'is-active': isExampleActive(group.path, item.name) }"
          @click="store.selectExample(group.path, item.name, group.label)"
        >
          <span class="apidoc-example-name">
            {{ item.name }}
            <!-- dev_docs 모드에서만 노출되는 개발자용 예제 표시 -->
            <span v-if="item.devOnly" class="apidoc-example-dev">dev</span>
          </span>
          <span v-if="item.description" class="apidoc-example-desc">{{ item.description }}</span>
        </button>
      </template>
      <p v-if="!store.exampleGroups.value.length" class="apidoc-empty">등록된 예제가 없습니다.</p>
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
