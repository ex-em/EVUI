<template>
  <div>
    <div class="article-title">
      <h2> Reactivity Chart </h2>
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
          :is-bottom="true"
        >
          <component :is="item.component"/>
        </code-view>
      </div>
      <br>
    </div>
  </div>
</template>

<script>
  import CodeView from '@/components/codeview/code';
  import ArrayFunc from './chart.reactivity.array.func';
  import ReplaceObj from './chart.reactivity.replace.object';

  export default {
    components: {
      CodeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/chart/chart.reactivity.array.func.vue',
            component: ArrayFunc,
            description: 'Array Function (push, shift)를 이용하여 Chart 데이터를 수정하여 watch를 trigger 합니다.',
            isBottom: true,
            title: 'Array Function',
          },
          {
            url: './guide/views/examples/chart/chart.reactivity.replace.object.vue',
            component: ReplaceObj,
            description: 'Series 객체의 참조를 변경하여 watch를 trigger한 뒤, newValue와 oldValue의 차이를 비교하여 Series를 새로 만듭니다.',
            isBottom: true,
            title: 'Series Object Replacement',
          },
        ],
      };
    },
  };
</script>
