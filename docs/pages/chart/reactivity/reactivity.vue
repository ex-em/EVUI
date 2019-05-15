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
      :vertical="false"
      :description="item.description"
      :contents="item.component"
      :url="item.url"
    />
    <ApiView
      :url="'./pages/chart/api/chart.md'"
    />
  </div>
</template>

<script>
  import ArrayFunc from './examples/array.func';
  import ReplaceObj from './examples/replace.object';

  export default {
    data() {
      return {
        title: 'Reactivity Chart',
        components: [{
          title: 'Array Function',
          component: ArrayFunc,
          url: './pages/chart/reactivity/examples/array.func.vue',
          description: 'Array Function (push, shift)를 이용하여 Chart 데이터를 수정하여 watch를 trigger 합니다.',
        }, {
          title: 'Series Object Replacement',
          component: ReplaceObj,
          url: './pages/chart/reactivity/examples/replace.object.vue',
          description: 'Series 객체의 참조를 변경하여 watch를 trigger한 뒤, newValue와 oldValue의 차이를 비교하여 Series를 새로 만듭니다.',
        }],
      };
    },
  };
</script>
