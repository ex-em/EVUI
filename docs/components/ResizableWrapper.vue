<template>
    <div class="resizable-wrapper">
        <div ref="componentArea" class="component-area" :style="componentAreaStyle">
            <slot />
        </div>
        <div ref="resizeHandle" class="resize-handle" @mousedown="startResize">
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue';
import { truthyNumber } from '@/common/utils';
import throttle from '@/common/utils.throttle';

export default {
  name: 'ResizableWrapper',
  props: {
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '100%',
    },
  },
  setup(props) {
    const componentArea = ref(null);
    const resizeHandle = ref(null);
    const componentHeight = ref(props.height);

    const componentAreaStyle = computed(() => {
      if (truthyNumber(componentHeight.value)) {
        return { height: `${componentHeight.value}px` };
      }
      if (typeof props.height === 'string') {
        return { height: props.height };
      }
      return {};
    });

    const startResize = (e) => {
      e.preventDefault();
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';

      const startY = e.clientY;
      const startHeight = componentArea.value.offsetHeight;

      // throttle을 적용하여 성능 최적화 (약 60fps로 제한)
      const onMouseMove = throttle((ev) => {
        const delta = ev.clientY - startY;
        const newHeight = Math.max(50, startHeight + delta);
        componentHeight.value = newHeight;
      }, 16); // 16ms = 약 60fps

      const onMouseUp = () => {
        // throttle된 함수의 마지막 업데이트를 즉시 실행
        onMouseMove.flush();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    return {
      componentArea,
      resizeHandle,
      componentAreaStyle,
      startResize,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../style/index.scss';

.resizable-wrapper {
  .component-area {
    overflow: hidden;
  }

  .resize-handle {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 6px;
    cursor: row-resize;
    background: transparent;
    &:hover,
    &:active {
      background: rgba($color-blue, 0.3);
    }
  }
}
</style>
