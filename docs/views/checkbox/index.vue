<template>
  <h2 class="content-title">
    Checkbox
  </h2>
  <Example
    v-for="(component, index) in components"
    :key="`${component.title}_${index}`"
    :title="component.title"
    :description="component.description"
    :contents="component.component"
    :url="component.url"
    :code-text="component.codeText"
  />
  <MarkdownView
    :source="mdText"
  />
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { parseComponent } from 'vue-template-compiler';
import Example from '../../components/Example';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import MarkdownView from '../../components/MarkdownView';
import CheckboxMd from '!!raw-loader!./api/checkbox.md';

export default {
  name: 'Checkbox',
  components: {
    Example,
    MarkdownView,
  },
  inheritAttrs: false,
  setup() {
    const mdText = CheckboxMd;
    const { template, script } = parseComponent(DefaultRaw);
    const codeTextObj = {
      template: template.content,
      script: script.content,
    };

    const components = [
      {
        title: 'Default',
        description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
        component: defineAsyncComponent(() => Promise.resolve(Default)),
        url: './docs/views/checkbox/example/Default.vue',
        codeText: codeTextObj,
      },
    ];

    return {
      mdText,
      components,
    };
  },
};
</script>
