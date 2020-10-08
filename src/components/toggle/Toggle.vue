<template>
  <div
    class="ev-toggle"
    :class="{
      disabled,
    }"
    @click.prevent="clickToggle"
  >
    <span
      class="ev-toggle-core"
      :class="{
        checked: modelValue,
        disabled,
      }"
      :style="{
        width: `${width}px`,
        border: `1px solid ${ modelValue ? activeColor : inactiveColor }`,
        'background-color': `${ modelValue ? activeColor : inactiveColor }`,
      }"
    />
  </div>
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
    const clickToggle = () => {
      if (!props.disabled) {
        mv.value = !mv.value;
      }
    };

    return {
      mv,
      clickToggle,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-toggle {
  display: inline-flex;
  position: relative;
  height: 20px;
  align-items: center;
  line-height: 20px;
  vertical-align: middle;
  font-size: $font-size-medium;

  &.disabled {
    opacity: .6;
  }
}

.ev-toggle-core {
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

  &.disabled:hover {
    cursor: not-allowed;
  }
}


</style>
