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
  </div>
</template>
<script>
  import Default from './examples/default';
  import Disabled from './examples/disabled';
  import Dots from './examples/dots';
  import Range from './examples/range';

  export default {
    data() {
      return {
        title: 'Slider',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/slider/examples/default.vue',
          description: `기본적인 슬라이더입니다.
                        마우스를 클릭하거나 드래그를 하여 조절할 수 있습니다.
                        step 속성으로 이동 단위를 설정할 수 있습니다.`,
        }, {
          title: 'Disabled',
          component: Disabled,
          url: './docs/pages/slider/examples/disabled.vue',
          description: `슬라이더를 비활성화 시킬 수 있습니다.
                        disabled 속성을 true 로 설정하십시오.`,
        }, {
          title: 'Dots',
          component: Dots,
          url: './docs/pages/slider/examples/dots.vue',
          description: `슬라이더에 step 마다 dot 을 표시할 수 있습니다.
                        showDots 속성을 true 로 설정하십시오.`,
        }, {
          title: 'Range',
          component: Range,
          url: './docs/pages/slider/examples/range.vue',
          description: `슬라이더에 범위를 줄 수 있습니다.
                        isRange 속성을 true 로 설정하십시오.`,
        }],
      };
    },
    methods: {
    },
  };
</script>
