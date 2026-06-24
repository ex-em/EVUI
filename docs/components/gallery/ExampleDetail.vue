<template>
  <div class="detail-topbar">
    <router-link :to="basePath" class="detail-back">
      <i class="ev-icon-arrow-left" /> Gallery
    </router-link>
    <h2 class="detail-title">{{ $route.name.replace(/Example$/, '') }}</h2>
  </div>

  <example
    v-if="current"
    :key="current.id"
    :title="current.title"
    :description="current.description"
    :component="current.component"
    :parsed-data="current.parsedData"
  />

  <div class="detail-pager">
    <router-link v-if="prev" :to="`${basePath}/${prev.id}`" class="detail-pager-btn">
      <i class="ev-icon-arrow-left" /> {{ prev.title }}
    </router-link>
    <span v-else />
    <router-link v-if="next" :to="`${basePath}/${next.id}`" class="detail-pager-btn">
      {{ next.title }} <i class="ev-icon-arrow-right" />
    </router-link>
    <span v-else />
  </div>
</template>

<script>
import { computed, watch } from 'vue';
import { kebabCase } from 'lodash-es';
import { useRoute, useRouter } from 'vue-router';
import Example from 'docs/components/Example';

export default {
  name: 'ExampleDetail',
  components: {
    Example,
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
    const router = useRouter();

    // '/lineChart/default' → '/lineChart'
    const basePath = computed(() => `/${route.path.split('/').filter(Boolean)[0]}`);
    const currentId = computed(() => route.params.exampleId);

    const items = computed(() =>
      Object.entries(props.components).map(([name, value]) => ({
        id: kebabCase(name),
        title: name,
        description: value.description,
        component: value.component,
        parsedData: value.parsedData,
      })),
    );

    const currentIndex = computed(() =>
      items.value.findIndex((item) => item.id === currentId.value),
    );
    const current = computed(() => items.value[currentIndex.value] ?? null);
    const prev = computed(() => items.value[currentIndex.value - 1] ?? null);
    const next = computed(() => items.value[currentIndex.value + 1] ?? null);

    // 잘못된 exampleId 로 들어오면 갤러리로 되돌린다.
    watch(
      [items, currentIndex],
      () => {
        if (items.value.length && currentIndex.value < 0) {
          router.replace(basePath.value);
        }
      },
      { immediate: true },
    );

    return {
      basePath,
      currentId,
      items,
      current,
      prev,
      next,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.detail-topbar {
  display: flex;
  position: sticky;
  z-index: 4;
  top: $header-height;
  align-items: center;
  gap: 16px;
  padding: 15px 0;
  margin-bottom: 20px;

  @include themify() {
    background-color: themed('background-color-base');
    border-bottom: 1px solid themed('border-color-base');
  }
}

.detail-title {
  font-size: 28px;
  font-weight: bold;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  text-decoration: none;
  transition: all $animate-fast;

  @include themify() {
    background-color: themed('background-color-description');
    border: 1px solid themed('border-color-base');
    color: themed('font-color-nav');
  }

  &:hover {
    background-color: $color-blue;
    border-color: $color-blue;
    color: $color-white;
  }
}

.detail-pager {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 30px;
}

.detail-pager-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 45%;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  transition: all $animate-fast;

  @include themify() {
    background-color: themed('background-color-base');
    border: 1px solid themed('border-color-base');
    color: themed('font-color-base');
  }

  &:hover {
    border-color: $color-blue;
    color: $color-blue;
  }
}
</style>
