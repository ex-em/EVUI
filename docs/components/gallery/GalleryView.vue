<template>
  <div class="gallery-header">
    <h2 class="content-title">
      {{ $route.name }}
    </h2>
    <router-link v-if="mdText" :to="`${basePath}/api`" class="gallery-api-link">
      API Docs <i class="ev-icon-arrow-right" />
    </router-link>
  </div>

  <div class="gallery-toolbar">
    <div class="gallery-search">
      <i class="ev-icon-search gallery-search-icon" />
      <input
        v-model="query"
        class="gallery-search-input"
        type="text"
        placeholder="Search examples..."
        @keydown.esc="query = ''"
      />
      <i v-if="query" class="ev-icon-close gallery-search-clear" @click="query = ''" />
    </div>
    <span class="gallery-count">{{ filteredCards.length }} / {{ cards.length }}</span>
  </div>

  <div v-if="filteredCards.length" class="gallery-grid">
    <gallery-card
      v-for="card in filteredCards"
      :key="card.id"
      :to="`${basePath}/${card.id}`"
      :title="card.title"
      :description="card.description"
      :component="card.component"
    />
  </div>
  <p v-else class="gallery-no-results">검색 결과가 없습니다.</p>
</template>

<script>
import { computed, ref } from 'vue';
import { kebabCase } from 'lodash-es';
import { useRoute } from 'vue-router';
import GalleryCard from './GalleryCard.vue';

export default {
  name: 'GalleryView',
  components: {
    GalleryCard,
  },
  inheritAttrs: false,
  props: {
    mdText: {
      type: String,
      default: '',
    },
    components: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const route = useRoute();
    const query = ref('');

    const basePath = computed(() => route.path.replace(/\/$/, ''));

    const cards = computed(() =>
      Object.entries(props.components).map(([name, value]) => ({
        id: kebabCase(name),
        title: name,
        description: value.description,
        component: value.component,
      })),
    );

    const filteredCards = computed(() => {
      const q = query.value.toLowerCase().trim();
      if (!q) return cards.value;
      return cards.value.filter((card) => card.title.toLowerCase().includes(q));
    });

    return {
      query,
      basePath,
      cards,
      filteredCards,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

/* 페이지 타이틀 옆에 API 링크를 배치하고, 밑줄(border)은 헤더 폭 전체로 유지한다. */
.gallery-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 15px;
  margin-bottom: 35px;

  @include themify() {
    border-bottom: 1px solid themed('border-color-base');
  }

  .content-title {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.gallery-toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.gallery-search {
  display: flex;
  position: relative;
  flex: 1;
  max-width: 320px;
  align-items: center;
}

.gallery-search-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  pointer-events: none;

  @include themify() {
    color: themed('color-disabled');
  }
}

.gallery-search-input {
  width: 100%;
  padding: 9px 32px 9px 34px;
  border-radius: 6px;
  font-size: 13px;
  outline: none;

  @include themify() {
    border: 1px solid themed('border-color-base');
    background-color: themed('background-color-description');
    color: themed('font-color-base');
  }

  &:focus {
    border-color: $color-blue !important;
  }
}

.gallery-search-clear {
  position: absolute;
  right: 12px;
  padding: 4px;
  cursor: pointer;
  font-size: 12px;

  @include themify() {
    color: themed('color-disabled');
  }
}

.gallery-count {
  font-size: 13px;

  @include themify() {
    color: themed('color-disabled');
  }
}

.gallery-api-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all $animate-fast;

  @include themify() {
    border: 1px solid themed('border-color-base');
    background-color: themed('background-color-base');
    color: themed('font-color-base');
  }

  &:hover {
    border-color: $color-blue;
    color: $color-blue;
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media all and (max-width: 1280px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media all and (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}

.gallery-no-results {
  padding: 60px 0;
  text-align: center;
  font-size: 14px;

  @include themify() {
    color: themed('color-disabled');
  }
}
</style>
