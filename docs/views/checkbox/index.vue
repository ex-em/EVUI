<template>
  <h2 class="content-title">
    Checkbox
  </h2>
  <example
    v-for="(value, name, index) in components"
    :key="`${name}_${index}`"
    v-bind="value"
    component-name="select"
    :title="name"
  />
  <markdown-view
    :source="mdText"
  />
</template>

<script>
import { ref, reactive, defineAsyncComponent, markRaw } from 'vue';
import { parseComponent } from 'vue-template-compiler';
import Example from 'docs/components/Example';
import MarkdownView from 'docs/components/MarkdownView';

export default {
  name: 'Checkbox',
  components: {
    Example,
    MarkdownView,
  },
  inheritAttrs: false,
  setup() {
    const mdText = ref('');
    const components = reactive({
      Default: {
        description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
        component: markRaw(defineAsyncComponent(() => import('./example/Default'))),
      },
      CheckboxGroup: {
        description: '체크박스 그룹 기능입니다.',
        component: markRaw(defineAsyncComponent(() => import('./example/CheckboxGroup'))),
      },
    });

    import('raw-loader!./api/checkbox.md').then((data) => {
      mdText.value = data.default;
    });
    import('!!raw-loader!./example/Default').then((data) => {
      components.Default.parsedData = parseComponent(data.default);
    });
    import('!!raw-loader!./example/CheckboxGroup').then((data) => {
      components.CheckboxGroup.parsedData = parseComponent(data.default);
    });

    return {
      mdText,
      components,
    };
  },
};
</script>
