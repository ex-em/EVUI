<template>
  <teleport to="#ev-window-modal">
    <transition
      name="ev-window-fade"
      appear
    >
      <div
        v-if="visible"
        id="ev-window-wrapper"
      >
        <div
          class="ev-window"
          :style="windowStyle"
        >
          <div
            v-if="iconClass && title"
            class="ev-window-header"
          >
            <span
              v-if="iconClass"
              class="ev-window-icon"
            >
              <i :class="iconClass"/>
            </span>
            <p
              v-if="title"
              class="ev-window-title"
            >
              {{ title }}
            </p>
          </div>
          <div class="ev-window-content">
            <slot/>
          </div>
          <span
            class="ev-window-close"
            @click="closeWin"
          >
            <i class="ev-icon-close"/>
          </span>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EvWindow',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: [String, Number],
      default: null,
    },
    iconClass: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '50%',
    },
  },
  emits: {
    'update:visible': [Boolean],
  },
  setup(props, { emit }) {
    /**
     * body에 ev-window-modal DIV를 append하는 로직
     */
    const initWrapperDiv = () => {
      const root = document.createElement('div');
      root.id = 'ev-window-modal';
      root.setAttribute('style', 'position: absolute; top: 0; left: 0;');
      const hasRoot = document.getElementById('ev-window-modal');
      if (!hasRoot) {
        document.body.appendChild(root);
      }
    };
    initWrapperDiv();

    const windowStyle = computed(() => ({
      width: props.width,
    }));
    /**
     * [x] 클릭 시 닫는 기능
     */
    const closeWin = () => {
      emit('update:visible', false);
    };

    return {
      windowStyle,
      closeWin,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

#ev-window-wrapper {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 700;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity .2s ease-in-out;
}

.ev-window {
  $padding-vertical: 20px;
  $padding-horizontal: 17px;

  display: flex;
  position: relative;
  max-height: 100%;
  padding: $padding-vertical $padding-horizontal;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: $default-radius;
  background-color: #FDFDFD;
  border: 1px solid #E3E3E3;
  transition: opacity .2s ease-in-out, transform .3s ease-in-out;
  font-size: $font-size-medium;
  line-height: 1.5em;

  &-fade-enter-active,
  &-fade-leave-active {
    .ev-window {
      opacity: 0;
      transform: translateY(-10%);
    }
  }

  &-header {
    display: flex;
    padding: 10px;
    font-weight: bold;
    font-size: $font-size-large;
  }

  &-content {
    padding: 20px;
    overflow: auto;
  }

  &-title {
    color: #303133;
  }

  &-icon {
    margin-right: $padding-horizontal;
  }

  &-close {
    position: absolute;
    top: $padding-vertical;
    right: $padding-horizontal;
    cursor: pointer;
  }
}
</style>
