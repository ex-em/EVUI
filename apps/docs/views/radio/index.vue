<template>
  <h2 class="content-title">
    Radio
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
import Example from 'docs/components/Example';
import MarkdownView from 'docs/components/MarkdownView';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import RadioGroup from './example/RadioGroup';
import RadioGroupRaw from '!!raw-loader!./example/RadioGroup';
import RadioMd from '!!raw-loader!./api/radio.md';

export default {
  name: 'Radio',
  components: {
    Example,
    MarkdownView,
  },
  inheritAttrs: false,
  setup() {
    const mdText = RadioMd;
    const components = [
      {
        title: 'Default',
        description: '여러 선택지 중 하나를 고르는 컴포넌트입니다. 라디오 버튼 특성상 하나의 요소만 사용할 수 없으며, <ev-radio-group>을 활용하는 것을 권장합니다.',
        component: defineAsyncComponent(() => Promise.resolve(Default)),
        url: './docs/views/radio/example/Default.vue',
        codeText: {
          template: parseComponent(DefaultRaw)?.template?.content,
          script: parseComponent(DefaultRaw)?.script?.content,
        },
      },
      {
        title: 'Radio Group',
        description: '<ev-radio>를 그룹지어 사용할 수 있습니다.',
        component: defineAsyncComponent(() => Promise.resolve(RadioGroup)),
        url: './docs/views/radio/example/RadioGroup.vue',
        codeText: {
          template: parseComponent(RadioGroupRaw)?.template?.content,
          script: parseComponent(RadioGroupRaw)?.script?.content,
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
