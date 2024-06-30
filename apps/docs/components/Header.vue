<template>
  <header class="evui-header">
    <h1 class="evui-header-logo">EVUI</h1>
    <span class="evui-header-version">{{ `v.${version}` }}</span>
    <p class="evui-header-name">EXEM Visualization UI</p>
    <span
      class="evui-header-theme"
    >
      <ev-icon
        :icon="themeIcon"
        @click="changeTheme"
      />
    </span>
  </header>
</template>

<script>
import { computed } from 'vue';
import { version } from '../../package.json';

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
      theme.value = theme.value === 'light' ? 'dark' : 'light';
    };
    const themeIcon = computed(() => (theme.value === 'light' ? 'ev-icon-sun' : 'ev-icon-moon'));

    return {
      version,
      theme,
      themeIcon,
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
    position: absolute;
    top: 50%;
    left: 10px;
    width: 110px;
    height: 30px;
    background: url('../assets/images/evui-logo.png') left center no-repeat;
    background-size: contain;
    transform: translateY(-50%);

    @include font-hide();
  }
  &-version {
    position: absolute;
    top: 43%;
    left: 110px;
    font-size: $font-size-large;
    color: #E8E8E8;
  }
  &-name {
    font-size: $font-size-large;
    color: #E8E8E8;
    text-align: center;
    line-height: $header-height;
  }
}
.evui-header-theme {
  position: absolute;
  top: 50%;
  right: 20px;
  width: 26px;
  height: 26px;
  transform: translateY(-50%);
  outline: none;
  border: none;
  cursor: pointer;
  font-size: 26px;
  color: #E8E8E8;
  transition: all $animate-fast;
  &:hover {
    opacity: 0.5;
  }
}
</style>
