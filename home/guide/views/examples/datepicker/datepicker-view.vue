<template>
  <div>
    <div class="article-title">
      <h2> Datepicker </h2>
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
  import calendarDefault from './datepicker-calendar';
  import datepickerDefault from './datepicker-default';
  import datepickerCustom from './datepicker-custom';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/datepicker/datepicker-calendar.vue',
            component: calendarDefault,
            description: `기본적인 달력입니다.
            해당 컴포넌트를 클릭하여 연, 월, 일 또는 여러 날짜를 선택할 수 있습니다.`,
            descriptionEng: `Use Basic Calendar for select date.
            You can choose year, month, day or multiple dates by click Calendar component.
            Picking a date range is supported.`,
            title: 'Default - Calendar',
          },
          {
            url: './guide/views/examples/datepicker/datepicker-default.vue',
            component: datepickerDefault,
            description: `기본적인 데이터피커입니다.
            해당 컴포넌트에 연, 월, 일 데이터를 선택할 수 있습니다.`,
            descriptionEng: `Use Basic Datepicker for date input.
            You can choose year, month, day by click calendar component or input text.`,
            title: 'Default - Datepicker',
          },
          {
            url: './guide/views/examples/datepicker/datepicker-custom.vue',
            component: datepickerCustom,
            description: `커스텀 데이트피커를 사용하여
            연, 월, 일 또는 다른 형식의 데이터를 선택할 수 있습니다.`,
            descriptionEng: `Use Custom Datepicker for date input.
            You can choose year, month, day by click calendar component or input text.`,
            title: 'Custom Datepicker',
          },
        ],
      };
    },
  };
</script>
