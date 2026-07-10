<template>
  <aside class="ad-sidebar">
    <!-- 컴포넌트 선택 (기존 네비게이션과 동일한 카테고리 트리) -->
    <div class="ad-sidebar-head">
      <button class="ad-component-picker" @click="isPickerOpen = !isPickerOpen">
        <span class="ad-picker-current">{{ store.doc.value.component }}</span>
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
              :disabled="!item.hasDoc"
              @click="pickComponent(item)"
            >
              {{ item.label }}
              <span v-if="!item.hasDoc" class="ad-picker-soon">준비중</span>
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
        @click="store.activeTab.value = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Docs 탭 -->
    <template v-if="store.activeTab.value === 'docs'">
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

    <!-- Examples 탭: 관련 페이지별 실제 예제 목록 -->
    <div v-else class="ad-examples">
      <template v-for="group in store.exampleGroups.value" :key="group.path">
        <p class="ad-tree-section">{{ group.label }}</p>
        <router-link
          v-for="item in group.items"
          :key="item.name"
          class="ad-example-link"
          :to="item.to"
        >
          <span class="ad-example-name">{{ item.name }}</span>
          <span v-if="item.description" class="ad-example-desc">{{ item.description }}</span>
        </router-link>
        <router-link v-if="!group.items.length" class="ad-example-link" :to="group.path">
          <span class="ad-example-name">{{ group.label }} 페이지로 이동</span>
        </router-link>
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
</script>
