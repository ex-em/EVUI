<template>
  <link ref="lightCss" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/styles/github.min.css">
  <link ref="darkCss" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/styles/hybrid.min.css" disabled>
  <div
    :class="['evui-docs', docsTheme]"
  >
    <div class="evui-wrapper">
      <MainHeader
        v-model="docsTheme"
      />
      <MainNav />
      <MainContent />
    </div>
  </div>
</template>

<script>
import { ref, watchEffect, onMounted } from 'vue';
import MainHeader from './components/Header';
import MainContent from './components/Content';
import MainNav from './components/Menu';

export default {
  name: 'Home',
  components: {
    MainHeader,
    MainContent,
    MainNav,
  },
  setup() {
    const docsTheme = ref('light');
    const lightCss = ref(null);
    const darkCss = ref(null);

    onMounted(() => {
      watchEffect(() => {
        if (docsTheme.value === 'light') {
          lightCss.value.disabled = false;
          darkCss.value.disabled = true;
        } else {
          lightCss.value.disabled = true;
          darkCss.value.disabled = false;
        }
      });
    });

    return {
      docsTheme,
      lightCss,
      darkCss,
    };
  },
};
</script>

<style lang="scss">
@import './style/index.scss';

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
}

.evui-wrapper {
  position: relative;
  min-height: 100vh;
  padding: $header-height 0 0 $nav-width;

  @include themify() {
    color: themed('font-color-base');
    background-color: themed('background-color-base');
  }
}
</style>
