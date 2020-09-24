<template>
  <h2 class="content-title">
    Select
  </h2>
  <example
    v-for="(component, index) in components"
    :key="`${component.title}_${index}`"
    :title="component.title"
    :description="component.description"
    :contents="component.component"
    :url="component.url"
    :code-text="component.codeText"
  />
  <markdown-view
    :source="mdText"
  />
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { parseComponent } from 'vue-template-compiler';
import Example from 'docs/components/Example';
import MarkdownView from 'docs/components/MarkdownView';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import apiMd from '!!raw-loader!./api/select.md';

export default {
  name: 'Select',
  components: {
    Example,
    MarkdownView,
  },
  inheritAttrs: false,
  setup() {
    const mdText = apiMd;

    const components = [
      {
        title: 'Default',
        description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
        component: defineAsyncComponent(() => Promise.resolve(Default)),
        url: './docs/views/select/example/Default.vue',
        codeText: {
          template: parseComponent(DefaultRaw)?.template?.content,
          script: parseComponent(DefaultRaw)?.script?.content,
        },
      },
    ];

    return {
      mdText,
      components,
    };
  },
};
</script>
