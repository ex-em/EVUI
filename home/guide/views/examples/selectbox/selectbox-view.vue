<template>
  <div>
    <div class="article-title">
      <h2> Select Box </h2>
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
          :height="item.height"
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
  import selectboxDefault from './selectbox-default';
  import selectboxSize from './selectbox-size';
  import selectboxReadOnly from './selectbox-read-only';
  import selectboxDisabled from './selectbox-disabled';
  import selectboxMultiple from './selectbox-multiple';
  import selectboxGroup from './selectbox-group';

  export default {
    components: {
      codeView,
      selectboxDefault,
      selectboxSize,
      selectboxReadOnly,
      selectboxDisabled,
      selectboxMultiple,
      selectboxGroup,
    },
    data() {
      return {
        componentList: [
          {
            title: 'Default',
            component: selectboxDefault,
            url: './guide/views/examples/selectbox/selectbox-default.vue',
            description: `기본적인 selectbox 입니다.
                          입력박스에는 텍스트를 입력받아 필터기능을 사용할 수 있습니다.
                          화살표 버튼을 클릭하여 선택을 확장할 수 있습니다.`,
          },
          {
            title: 'Size',
            component: selectboxSize,
            url: './guide/views/examples/selectbox/selectbox-size.vue',
            description: `selectbox 크기를 설정할 수 있습니다.
                          크기: small, medium, large (기본 값은 medium 입니다)`,
          },
          {
            title: 'Read Only',
            component: selectboxReadOnly,
            url: './guide/views/examples/selectbox/selectbox-read-only.vue',
            description: `selectbox 의 input field 에 입력을 막을 수 있습니다.
                          read-only 속성을 true 로 설정하십시오.`,
          },
          {
            title: 'Disabled',
            component: selectboxDisabled,
            url: './guide/views/examples/selectbox/selectbox-disabled.vue',
            description: `selectbox 를 비활성화 시킬 수 있습니다.
                          disabled 속성을 true 로 설정하십시오.`,
          },
          {
            title: 'Multiple',
            component: selectboxMultiple,
            url: './guide/views/examples/selectbox/selectbox-multiple.vue',
            description: `한개 이상의 선택이 가능합니다.
                          multiple 속성을 true 로 설정하십시오.`,
          },
          {
            title: 'Group',
            component: selectboxGroup,
            url: './guide/views/examples/selectbox/selectbox-group.vue',
            description: `그룹으로 옵션을 표시합니다.
                          isGroup 속성을 true 로 설정하면 옵션을 그룹화할 수 있습니다.`,
          },
        ],
      };
    },
  };
</script>
