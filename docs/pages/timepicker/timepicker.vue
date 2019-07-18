<template>
  <div>
    <div class="article-title">
      <h1> {{ title }} </h1>
    </div>
    <br>
    <Example
      v-for="(item, index) in components"
      :key="index"
      :title="item.title"
      :description="item.description"
      :contents="item.component"
      :url="item.url"
    />
    <ApiView
      :url="'./docs/pages/timepicker/api/timepicker.md'"
    />
  </div>
</template>

<script>
  import Default from './examples/default';
  import Init from './examples/init';

  export default {
    data() {
      return {
        title: 'Time Picker',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/timepicker/examples/default.vue',
          description: `시간을 선택하는 기본적인 타임피커입니다.
          드랍다운 컴포넌트에서 시, 분, 초를 선택할 수 있습니다.`,
          descriptionEng: `Use Basic Timepicker for select time.
          You can choose hour, minute, second by click drop-down component.`,
        }, {
          title: 'Init Value',
          component: Init,
          url: './docs/pages/timepicker/examples/init.vue',
          description: '입력 텍스트 컨포넌트에 시, 분, 초 데이터를 초기화할 수 있습니다.',
          descriptionEng: 'You can initialize hour, minute, second by input text component.',
        }],
      };
    },
  };
</script>
