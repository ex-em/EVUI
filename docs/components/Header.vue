<template>
  <header class="evui-header">
    <h1 class="evui-header-logo">EXEM Visualization UI</h1>
    <button
      class="evui-header-theme"
      @click="changeTheme"
    >
      {{ theme }}
    </button>
  </header>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    modelValue: {
      type: String,
      default: 'light',
    },
  },
  emits: {
    'update:modelValue': null,
  },
  setup(props, { emit }) {
    const theme = computed({
      get: () => props.modelValue,
      set: value => emit('update:modelValue', value),
    });
    const changeTheme = () => {
      if (theme.value === 'light') {
        theme.value = 'dark';
      } else {
        theme.value = 'light';
      }
    };

    return {
      theme,
      changeTheme,
    };
  },
};
</script>

<style  lang="scss" scoped>
@import '../style/index.scss';

a {
  text-decoration: none !important;
}
.evui-header {
  display: flex;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: $header-height;
  padding: 0 10px;
  align-items: center;
  background-color: $color-blue;
  z-index: 10;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);

  &-logo {
    height: 30px;
    line-height: 30px;
    padding-left: 110px;
    background: url('http://evui.ex-em.com/wp-content/uploads/2017/11/evui_1.png') left center no-repeat;
    background-size: contain;
    color: rgb(43,87,151);
    font-size: $font-size-large;
    font-weight: bold;
  }
}
.evui-header-theme {
  position: absolute;
  top: 50%;
  right: 20px;
  width: 60px;
  height: 25px;
  transform: translateY(-50%);
  outline: none;
  border: none;
  cursor: pointer;

  @include themify() {
    color: themed('font-color-base');
    background-color: themed('background-color-base');
  }
}
</style>
