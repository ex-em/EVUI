<template>
  <aside class="ad-sidebar">
    <!-- 컴포넌트 선택 -->
    <div class="ad-sidebar-head">
      <select
        class="ad-component-select"
        :value="store.currentKey.value"
        @change="store.setComponent($event.target.value)"
      >
        <option v-for="item in store.componentList.value" :key="item.key" :value="item.key">
          {{ item.label }}
        </option>
      </select>
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

    <!-- Examples 탭 -->
    <div v-else class="ad-examples">
      <router-link
        v-for="example in store.doc.value.examples"
        :key="example.route"
        class="ad-example-link"
        :to="example.route"
      >
        {{ example.label }}
      </router-link>
      <p v-if="!store.doc.value.examples?.length" class="ad-empty">등록된 예제가 없습니다.</p>
    </div>
  </aside>
</template>

<script setup>
import ApiTreeNode from './ApiTreeNode.vue';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const TABS = [
  { key: 'docs', label: 'Docs' },
  { key: 'examples', label: 'Examples' },
];

const store = useApiDocsStore();
</script>
