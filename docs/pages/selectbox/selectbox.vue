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
  import Size from './examples/size';
  import ReadOnly from './examples/read-only';
  import Disabled from './examples/disabled';
  import Multiple from './examples/multiple';
  import Group from './examples/group';

  export default {
    data() {
      return {
        title: 'SelectBox',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/selectbox/examples/default.vue',
          description: `기본적인 selectbox 입니다.
                        입력박스에는 텍스트를 입력받아 필터기능을 사용할 수 있습니다.
                        화살표 버튼을 클릭하여 선택을 확장할 수 있습니다.`,
        }, {
          title: 'Size',
          component: Size,
          url: './docs/pages/selectbox/examples/size.vue',
          description: `selectbox 크기를 설정할 수 있습니다.
                        크기: small, medium, large (기본 값은 medium 입니다)`,
        }, {
          title: 'Read Only',
          component: ReadOnly,
          url: './docs/pages/selectbox/examples/read-only.vue',
          description: `selectbox 의 input field 에 입력을 막을 수 있습니다.
                        read-only 속성을 true 로 설정하십시오.`,
        }, {
          title: 'Disabled',
          component: Disabled,
          url: './docs/pages/selectbox/examples/disabled.vue',
          description: `selectbox 를 비활성화 시킬 수 있습니다.
                        disabled 속성을 true 로 설정하십시오.`,
        }, {
          title: 'Multiple',
          component: Multiple,
          url: './docs/pages/selectbox/examples/multiple.vue',
          description: `한개 이상의 선택이 가능합니다.
                        multiple 속성을 true 로 설정하십시오.`,
        }, {
          title: 'Group',
          component: Group,
          url: './docs/pages/selectbox/examples/group.vue',
          description: `그룹으로 옵션을 표시합니다.
                        isGroup 속성을 true 로 설정하면 옵션을 그룹화할 수 있습니다.`,
        }],
      };
    },
  };
</script>
