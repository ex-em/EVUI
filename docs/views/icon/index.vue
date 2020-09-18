<template>
  <h2 class="content-title">
    Icon
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
  <IconList />
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
  import IconList from './example/IconList';
  import MarkdownView from '../../components/MarkdownView';
  import IconMd from '!!raw-loader!./api/icon.md';

  export default {
    name: 'Icon',
    components: {
      Example,
      IconList,
      MarkdownView,
    },
    inheritAttrs: false,
    setup() {
      const mdText = IconMd;

      const components = [
        {
          title: 'Default',
          description: 'EVUI에서 제공하는 아이콘입니다.',
          component: defineAsyncComponent(() => Promise.resolve(Default)),
          url: './docs/views/icon/example/Default.vue',
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
