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
      :url="'./pages/button/api/button.md'"
    />
  </div>
</template>

<script>
  import Type from './examples/type';
  import Size from './examples/size';
  import Shape from './examples/shape';
  import Disabled from './examples/disabled';

  export default {
    data() {
      return {
        title: 'Button',
        components: [{
          title: 'Type',
          component: Type,
          url: './pages/button/examples/type.vue',
          description: `버튼의 타입을 설정할 수 있습니다.
                        버튼 타입: default, primary, ghost, dashed, text 등
                        타입 속성을 적지 않을 경우, 기본 값은 default 입니다.`,
        }, {
          title: 'Size',
          component: Size,
          url: './pages/button/examples/size.vue',
          description: `버튼의 크기를 설정할 수 있습니다.
                        버튼 크기: 작음, 중간, 큼
                        기본 값은 중간입니다.`,
        }, {
          title: 'Shape',
          component: Shape,
          url: './pages/button/examples/shape.vue',
          description: `버튼의 모양을 설정할 수 있습니다.
                        원형 버튼을 사용하려면 도형을 원형으로 설정하십시오.
                        기본 값은 모서리가 둥근 사각형입니다.`,
        }, {
          title: 'Disabled',
          component: Disabled,
          url: './pages/button/examples/disabled.vue',
          description: `버튼을 비활성화 시킬 수 있습니다.
                        disabled 속성을 true 로 설정하십시오.`,
        }],
      };
    },
  };
</script>
