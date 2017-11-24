<template>
  <div id="app">
    <h1>DocumentA</h1>
    <div class="content">
      <h1>DocumentA</h1>
      <ul class="tab-title">
        <li v-for="name in tabList" :class="{active: name===active}" @click="tabChange(name)" :key="name.id">
          <span>{{ name }}</span>
        </li>
        <li><button @click="updateResult()">Check Result</button></li>
      </ul>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  data() {
  },
  methods: {
  },
  mounted() {
    console.log('----------------------- App -----------------------');
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.content {
  width: calc(calc(100% - 200px)/2);
  float: left;
  background: #44ccf1;
}

.tab-title {
  height: 32px; margin: 20px 0 0 0; padding:0;
  border-bottom: 1px solid #ccc;
  list-style: none;
}
.tab-title li {
  min-width: 100px; height: 32px; line-height:32px; float: left; margin-right: 10px;
  text-align:center; cursor: pointer;
  background: #eee; color: #333;
  position: relative;
}
.tab-title li.active {background: #31BFCF; color:#fff;}
</style>
