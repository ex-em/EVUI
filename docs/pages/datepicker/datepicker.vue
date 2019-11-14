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
      :url="'./docs/pages/datepicker/api/datepicker.md'"
    />
  </div>
</template>

<script>
  import Calendar from './examples/calendar';
  import Default from './examples/default';
  import Custom from './examples/custom';

  export default {
    data() {
      return {
        title: 'Date Picker',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/datepicker/examples/default.vue',
          description: `기본적인 데이터피커입니다.
            해당 컴포넌트에 연, 월, 일 데이터를 선택할 수 있습니다.`,
          descriptionEng: `Use Basic Datepicker for date input.
            You can choose year, month, day by click calendar component or input text.`,
        }, {
            title: 'Calendar',
            component: Calendar,
            url: './docs/pages/datepicker/examples/calendar.vue',
            description: `기본적인 달력입니다.
            해당 컴포넌트를 클릭하여 연, 월, 일 또는 여러 날짜를 선택할 수 있습니다.`,
            descriptionEng: `Use Basic Calendar for select date.
            You can choose year, month, day or multiple dates by click Calendar component.
            Picking a date range is supported.`,
        }, {
            title: 'Custom',
            component: Custom,
            url: './docs/pages/datepicker/examples/custom.vue',
            description: `커스텀 데이트피커를 사용하여
            연, 월, 일 또는 다른 형식의 데이터를 선택할 수 있습니다.`,
            descriptionEng: `Use Custom Datepicker for date input.
            You can choose year, month, day by click calendar component or input text.`,
        }],
      };
    },
  };
</script>
