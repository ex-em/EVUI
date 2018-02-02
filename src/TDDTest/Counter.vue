<template>
  <div>
    {{ count }}
    <p>{{propValue}}</p>
    <button @click="increment">Increment</button>
   <input type="text" v-model:value="count" />
    <h2> Find Quality Of Life Statistics By City </h2>
    <stat-view :city="currentCity" :categories="categories" v-if="!noResults && categories.length"></stat-view>
    <p class="msg-error" v-show="noResults"> no results found for "{{currentCity}}" </p>

  </div>


</template>

<script>
  export default {
    props: ['propValue' ,'title'],
    data () {
      return {
        count: 0,
        categories: [],
        currentCity: '',
        noResults: false,
        query: '',
      }
    },
    computed: {
      isEmptyQuery() {
        return this.query.length === 0;
      },
    },
    watch: {
      count () {
        alert('dom 데이타 변경3');
        this.$nextTick(() => {
          alert('dom 데이타 변경');
        });
      }
    },
    methods: {
      increment () {
        alert('dom 데이타 변경2');
        this.count++
      },
      handleNoResults(city){
        this.noResults = true;
        this.currentCity = city;
        this.categories.length = 0;
      },
      onSearch() {
        this.$emit('search', { query: this.query });
      },
      onReset() {
        this.query = '';
      },
      onSearch(data) {
        alert(data.query);
      },
    }
  }
</script>
