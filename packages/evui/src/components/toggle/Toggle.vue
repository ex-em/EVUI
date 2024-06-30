<template>
  <div
    class="ev-toggle"
    :class="{
      checked: modelValue,
      disabled,
      readonly,
    }"
    :style="{
      width: `${width}px`,
      border: `1px solid ${ modelValue ? activeColor : inactiveColor }`,
      'background-color': `${ modelValue ? activeColor : inactiveColor }`,
    }"
    @click="clickMv"
  />
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EvToggle',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 40,
    },
    activeColor: {
      type: String,
      default: '#409EFF',
    },
    inactiveColor: {
      type: String,
      default: '#DCDFE6',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
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

    return {
      mv,
      clickMv,
    };
  },
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
  transition: border-color .3s, background-color .3s;
  outline: none;
  cursor: pointer;

  &:after {
    position: absolute;
    top: 1px;
    left: 1px;
    border-radius: 100%;
    transition: all .3s;
    width: 16px;
    height: 16px;
    background-color: $color-white;
    content: '';
  }

  &.checked:after {
    left: calc(100% - 17px);
  }

  &.readonly {
    opacity: .6;
    cursor: default;
  }

  &.disabled {
    opacity: .6;
    cursor: not-allowed;
  }
}


</style>
