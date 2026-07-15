<template>
  <div
    class="evui-wrapper"
    :class="['evui-docs', docsTheme, { 'internal-docs': isInternalDocs }]"
  >
    <MainHeader v-model="docsTheme" />
    <MainContent />
  </div>
</template>

<script>
import { ref } from 'vue';
import MainHeader from './components/Header';
import MainContent from './components/Content';
import { IS_INTERNAL_DOCS } from 'docs/views/apiDocs/pages';

export default {
  name: 'Home',
  components: {
    MainHeader,
    MainContent,
  },
  setup() {
    const docsTheme = ref('light');

    return {
      docsTheme,
      isInternalDocs: IS_INTERNAL_DOCS,
    };
  },
};
</script>

<style lang="scss">
$file-path: './assets/fonts/';

@import './style/index.scss';

@font-face {
  font-family: 'Roboto';
  src: url($file-path + 'Roboto-Bold.ttf') format('trutype');
  font-weight: 800;
  font-style: normal;
}
@font-face {
  font-family: 'Roboto';
  src: url($file-path + 'Roboto-Medium.ttf') format('trutype');
  font-weight: 600;
  font-style: normal;
}
@font-face {
  font-family: 'Roboto';
  src: url($file-path + 'Roboto-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: 'Roboto', Arial, 'Helvetica Neue', Helvetica, sans-serif;
}
.evui-wrapper {
  position: relative;
  padding: $header-height 0 0;
  font-size: $font-size-base;
}

/* 개발자용 모드(npm run dev_docs): 대외용과 즉시 구분되도록 primary를 앰버로 교체 */
.evui-wrapper.internal-docs {
  .evui-header {
    background-color: #d97706;
  }

  .api-docs {
    --ad-primary: #d97706;
    --ad-primary-soft: rgba(217, 119, 6, 0.12);
  }
}
.dark {
  @import './style/lib/highlightjs.hybrid';
}
.light {
  @import './style/lib/highlightjs.github';
}
.hljs {
  &,
  * {
    font-size: 14px;
    font-family: consolas, monospace;
  }
}
</style>
