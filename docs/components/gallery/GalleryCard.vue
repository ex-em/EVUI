<template>
  <router-link ref="rootRef" :to="to" class="gallery-card">
    <div class="gallery-card-preview">
      <!-- 뷰포트에 보일 때만 실제 컴포넌트를 마운트한다 (lazy) -->
      <div v-if="mounted" class="gallery-card-stage">
        <component :is="component" />
      </div>
      <div v-else class="gallery-card-placeholder">
        <i class="ev-icon-chart2" />
      </div>
    </div>
    <div class="gallery-card-meta">
      <h4 class="gallery-card-title">
        {{ title }}
      </h4>
      <p class="gallery-card-desc" v-html="description" />
    </div>
  </router-link>
</template>

<script>
import { ref, onMounted, onUnmounted, provide } from 'vue';

export default {
  name: 'GalleryCard',
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    component: {
      type: Object,
      default: null,
    },
  },
  setup() {
    const rootRef = ref(null);
    const mounted = ref(false);
    let observer = null;

    // 썸네일은 좁으므로 범례와 줌 툴바를 숨겨 차트 영역을 최대한 확보하고 깔끔하게 보인다.
    provide('evChartOptionsOverride', {
      legend: { show: false },
      zoom: { toolbar: { show: false } },
    });

    onMounted(() => {
      // router-link 의 실제 DOM element
      const el = rootRef.value?.$el ?? rootRef.value;
      if (!el || typeof IntersectionObserver === 'undefined') {
        mounted.value = true;
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            mounted.value = true;
            observer.disconnect();
            observer = null;
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(el);
    });

    onUnmounted(() => {
      observer?.disconnect();
      observer = null;
    });

    return {
      rootRef,
      mounted,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.gallery-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform $animate-fast,
    box-shadow $animate-fast,
    border-color $animate-fast;

  @include themify() {
    border: 1px solid themed('border-color-base');
    background-color: themed('background-color-base');
    color: themed('font-color-base');
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    border-color: $color-blue;
  }
}

.gallery-card-preview {
  position: relative;
  height: 200px;
  overflow: hidden;

  @include themify() {
    border-bottom: 1px solid themed('border-color-base');
    background-color: themed('background-color-description');
  }

  // 미리보기에서는 차트 내부 컨트롤과 상호작용하지 않는다.
  .gallery-card-stage {
    width: 100%;
    height: 100%;
    padding: 10px 14px;
    pointer-events: none;
  }

  // 예제가 차트를 300px 등으로 고정해도 미리보기 높이에 꽉 맞춰 잘리지 않게 한다.
  // (EvChart는 반응형이라 컨테이너 크기에 맞춰 다시 그려진다.)
  .gallery-card-stage .case,
  .gallery-card-stage .resizable-wrapper,
  .gallery-card-stage .component-area,
  .gallery-card-stage .ev-chart {
    height: 100% !important;
  }
}

.gallery-card-placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 32px;

  @include themify() {
    color: themed('color-disabled');
  }
}

.gallery-card-meta {
  padding: 12px 14px;
}

.gallery-card-title {
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 600;
}

.gallery-card-desc {
  font-size: 12px;
  line-height: 1.45em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @include themify() {
    color: themed('font-color-nav');
  }
}
</style>
