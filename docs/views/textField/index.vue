<template>
  <h2 class="content-title">
    Textfield
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
  import Password from './example/Password';
  import PasswordRaw from '!!raw-loader!./example/Password';
  import Textarea from './example/Textarea';
  import TextareaRaw from '!!raw-loader!./example/Textarea';
  import TextfieldMd from '!!raw-loader!./api/textfield.md';

  export default {
    name: 'Radio',
    components: {
      Example,
      MarkdownView,
    },
    inheritAttrs: false,
    setup() {
      const mdText = TextfieldMd;
      const components = [
        {
          title: 'Default',
          description: 'Text 입력 가능한 input 컴포넌트입니다.',
          component: defineAsyncComponent(() => Promise.resolve(Default)),
          url: './docs/views/textfield/example/Default.vue',
          codeText: {
            template: parseComponent(DefaultRaw)?.template?.content,
            script: parseComponent(DefaultRaw)?.script?.content,
          },
        },
        {
          title: 'Password',
          description: 'Password를 입력할 수 있는 input 컴포넌트입니다.',
          component: defineAsyncComponent(() => Promise.resolve(Password)),
          url: './docs/views/textfield/example/Password.vue',
          codeText: {
            template: parseComponent(PasswordRaw)?.template?.content,
            script: parseComponent(PasswordRaw)?.script?.content,
          },
        },
        {
          title: 'Textarea',
          description: 'Password를 입력할 수 있는 input 컴포넌트입니다.',
          component: defineAsyncComponent(() => Promise.resolve(Textarea)),
          url: './docs/views/textfield/example/Textarea.vue',
          codeText: {
            template: parseComponent(TextareaRaw)?.template?.content,
            script: parseComponent(TextareaRaw)?.script?.content,
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
