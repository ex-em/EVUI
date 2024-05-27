<template>
  <template v-if="props.fullscreen">
    <teleport to="body">
      <div
        v-if="props.modelValue"
        class="ev-loading full-screen"
        @[`${clickEventName}`]="closeLoading"
      >
        <div class="ev-loading-spinner">
          <template v-if="$slots.default">
            <slot />
          </template>
          <template v-else>
            <i
              :class="props.iconClass || 'ev-icon-refresh2'"
              class="ev-loading-icon"
              :style="props.iconStyle"
            />
          </template>
        </div>
      </div>
    </teleport>
  </template>
  <template v-else>
    <div
      v-if="props.modelValue"
      class="ev-loading"
      @[`${clickEventName}`]="closeLoading"
    >
      <div class="ev-loading-spinner">
        <template v-if="$slots.default">
          <slot />
        </template>
        <template v-else>
          <i
            :class="props.iconClass || 'ev-icon-refresh2'"
            class="ev-loading-icon"
            :style="props.iconStyle"
          />
        </template>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'EvLoading',
});
interface Props {
  modelValue?: boolean;
  fullscreen?: boolean;
  clickOutside?: boolean;
  iconStyle?: Record<string, any>;
  iconClass?: string;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  fullscreen: false,
  clickOutside: false,
  iconStyle: () => ({}),
});

interface Emits {
  (event: 'update:modelValue', value: boolean): void;
}
const emit = defineEmits<Emits>();

const clickEventName = computed(() => (props.clickOutside ? 'click' : null));
const closeLoading = () => emit('update:modelValue', false);
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
  opacity: 0.5;
  &.full-screen {
    position: fixed;
  }
}
.ev-loading-spinner {
  position: absolute;
  top: 50%;
  width: 100%;
  color: #409eff;
  text-align: center;
}
.ev-loading-icon {
  display: inline-block;
  font-size: 25px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0);
  }
}
</style>
