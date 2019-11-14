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
  export default {
    data() {
      return {
        title: 'Splitter',
        components: [
        ],
      };
    },
  };
</script>
