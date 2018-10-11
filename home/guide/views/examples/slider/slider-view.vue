<template>
  <div>
    <div class="article-title">
      <h2> {{ title }} </h2>
    </div>
    <br>
    <div
      v-for="item in buttonComponentList"
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
  import sliderDefault from './slider-default';
  import sliderDisabled from './slider-disabled';
  import sliderDots from './slider-dots';
  import sliderRange from './slider-range';

  export default {
    components: {
      codeView,
      sliderDefault,
      sliderDisabled,
      sliderDots,
      sliderRange,
    },
    data() {
      return {
        title: 'Button',
        buttonComponentList: [
          {
            title: 'Default',
            component: sliderDefault,
            url: './guide/views/examples/slider/slider-default.vue',
            description: `기본적인 슬라이더입니다.
                          마우스를 클릭하거나 드래그를 하여 조절할 수 있습니다.
                          step 속성으로 이동 단위를 설정할 수 있습니다.`,
          },
          {
            title: 'Disabled',
            component: sliderDisabled,
            url: './guide/views/examples/slider/slider-default.vue',
            description: `슬라이더를 비활성화 시킬 수 있습니다.
                          disabled 속성을 true 로 설정하십시오.`,
          },
          {
            title: 'Dots',
            component: sliderDots,
            url: './guide/views/examples/slider/slider-dots.vue',
            description: `슬라이더에 step 마다 dot 을 표시할 수 있습니다.
                          showDots 속성을 true 로 설정하십시오.`,
          },
          {
            title: 'Range',
            component: sliderRange,
            url: './guide/views/examples/slider/slider-range.vue',
            description: `슬라이더에 범위를 줄 수 있습니다.
                          isRange 속성을 true 로 설정하십시오.`,
          },
        ],
      };
    },
    methods: {
    },
  };
</script>
