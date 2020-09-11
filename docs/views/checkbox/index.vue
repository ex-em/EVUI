<template>
  <div class="article-title">
    <h1> CHECK BOX </h1>
  </div>
  <br><hr><br>
  <Example
    v-for="(component, index) in components"
    :key="`${component.title}_${index}`"
    :title="component.title"
    :description="component.description"
    :contents="component.component"
    :url="component.url"
  />
</template>

<script>
import { ref, defineAsyncComponent } from 'vue';
import Example from '../../components/Example';
import Default from './example/Default';

export default {
  name: 'Checkbox',
  components: {
    Example,
  },
  inheritAttrs: false,
  setup() {
    const checkVal1 = ref(true);
    const checkVal2 = ref(false);
    const checkVal3 = ref(false);

    const onChange = (value, e) => {
      console.log(`value: ${value}, e : ${e}`);
    };

    const components = [
      {
        title: 'Default',
        description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
        component: defineAsyncComponent(() => Promise.resolve(Default)),
        url: './docs/views/checkbox/example/Default.vue',
      },
    ];

    return {
      checkVal1,
      checkVal2,
      checkVal3,
      components,
      onChange,
    };
  },
};
</script>
