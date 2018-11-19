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
  import buttonType from './button-type';
  import buttonSize from './button-size';
  import buttonShape from './button-shape';
  import buttonDisabled from './button-disabled';

  export default {
    components: {
      codeView,
      buttonType,
      buttonSize,
      buttonShape,
      buttonDisabled,
    },
    data() {
      return {
        title: 'Button',
        buttonComponentList: [
          {
            title: 'Type',
            component: buttonType,
            url: './guide/views/examples/button/button-type.vue',
            description: `버튼의 타입을 설정할 수 있습니다.
                          버튼 타입: default, primary, ghost, dashed, text 등
                          타입 속성을 적지 않을 경우, 기본 값은 default 입니다.`,
          },
          {
            title: 'Size',
            component: buttonSize,
            url: './guide/views/examples/button/button-size.vue',
            description: `버튼의 크기를 설정할 수 있습니다.
                          버튼 크기: 작음, 중간, 큼
                          기본 값은 중간입니다.`,
          },
          {
            title: 'Shape',
            component: buttonShape,
            url: './guide/views/examples/button/button-shape.vue',
            description: `버튼의 모양을 설정할 수 있습니다.
                          원형 버튼을 사용하려면 도형을 원형으로 설정하십시오.
                          기본 값은 모서리가 둥근 사각형입니다.`,
          },
          {
            title: 'Disabled',
            component: buttonDisabled,
            url: './guide/views/examples/button/button-disabled.vue',
            description: `버튼을 비활성화 시킬 수 있습니다.
                          disabled 속성을 true 로 설정하십시오.`,
          },
        ],
      };
    },
    methods: {
    },
  };
</script>
