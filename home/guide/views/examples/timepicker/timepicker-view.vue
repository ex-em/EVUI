<template>
  <div>
    <div class="article-title">
      <h2> Timepicker </h2>
    </div>
    <br>
    <div
      v-for="item in componentList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
          :description="item.description"
        >
          <component :is="item.component"/>
        </code-view>
      </div>
      <br>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import timepickerDefault from './timepicker-default';
  import timepickerDisable from './timepicker-disable';
  import timepickerInit from './timepicker-init';

  export default {
    components: {
      codeView,
      timepickerDefault,
      timepickerDisable,
      timepickerInit,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/timepicker/timepicker-default.vue',
            component: timepickerDefault,
            description: `시간을 선택하는 기본적인 타임피커입니다.
            드랍다운 컴포넌트에서 시, 분, 초를 선택할 수 있습니다.`,
            descriptionEng: `Use Basic Timepicker for select time.
            You can choose hour, minute, second by click drop-down component.`,
            title: 'Default',
          },
//          {
//            url: './guide/views/examples/timepicker/timepicker-disable.vue',
//            component: timepickerDisable,
//            description: '',
//            descriptionEng: 'Disable Timepicker.',
//            title: 'Disable',
//          },
          {
            url: './guide/views/examples/timepicker/timepicker-init.vue',
            component: timepickerInit,
            description: '입력 텍스트 컨포넌트에 시, 분, 초 데이터를 초기화할 수 있습니다.',
            descriptionEng: 'You can initialize hour, minute, second by input text component.',
            title: 'Init Value',
          },
        ],
      };
    },
  };
</script>
