<template>
  <div
    class="ev-toggle"
    :class="{
      checked: mv,
      disabled,
      readonly,
    }"
    :style="{
      width: `${props.width}px`,
      border: `1px solid ${mv ? activeColor : inactiveColor}`,
      'background-color': `${mv ? activeColor : inactiveColor}`,
    }"
    @click="clickMv"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'EvToggle',
});
interface Props {
  modelValue: boolean;
  readonly?: boolean;
  disabled?: boolean;
  width?: number;
  activeColor?: string;
  inactiveColor?: string;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  readonly: false,
  disabled: false,
  width: 40,
  activeColor: '#409EFF',
  inactiveColor: '#DCDFE6',
});

interface Emits {
  (event: 'update:modelValue', value: boolean): void;
  (event: 'change', value: boolean): void;
}
const emit = defineEmits<Emits>();

const mv = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
    emit('change', val);
  },
});
const clickMv = () => {
  if (!props.disabled && !props.readonly) {
    mv.value = !mv.value;
  }
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-toggle {
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
  margin: 0;
  border-radius: 10px;
  box-sizing: border-box;
  transition:
    border-color 0.3s,
    background-color 0.3s;
  outline: none;
  cursor: pointer;

  &:after {
    position: absolute;
    top: 1px;
    left: 1px;
    border-radius: 100%;
    transition: all 0.3s;
    width: 16px;
    height: 16px;
    background-color: $color-white;
    content: '';
  }

  &.checked:after {
    left: calc(100% - 17px);
  }

  &.readonly {
    opacity: 0.6;
    cursor: default;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
