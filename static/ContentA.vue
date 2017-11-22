<template>
  <div id="app">
    <div class="loading" v-if="isLoading">Loading...</div>
    <div class="error" v-if="isError">{{ isError }}</div>
    <h1>App</h1>
    <cmp-nav v-on:getVueFile="getVueFile"></cmp-nav>
    <div class="content">
      <h1>Content</h1>
      <ul class="tab-title">
        <li v-for="name in tabList" :class="{active: name===active}" @click="tabChange(name)" :key="name.id">
          <span>{{ name }}</span>
        </li>
        <li><button @click="updateResult()">Check Result</button></li>
      </ul>
    </div>
    <cmp-result ref="cmpResult" :fileList="vueFileList"></cmp-result>
  </div>
</template>

<script>

export default {
  components: {
    'cmp-nav': Nav,
    'cmp-content': Content,
    'cmp-result': Result
  },
  data() {
    return {
      isLoading: false,
      isError: false,
      active: 'default',
      tabList: ['CODE', 'HTML', 'JAVASCRIPT', 'CSS'],
      //key -> file name, value -> {template: '', style: '', script: ''}
      vueFileList: {
        'test' : {
          template: '<template><\/template>',
          style: '<style><\/style>',
          script: '<script><\/script>'
        }
      }
    }
  },
  methods: {
    updateResult () {
      this.$refs.cmpResult.update( this.$refs.contentView.getContentName(), this.$refs.contentView.getValue() );
    },
    emitContent (id) {
      var contentView;

      if ( id == 'updateResult' ) {
        contentView = this.$refs.contentView;
        this.$refs.cmpResult.update( contentView.getContentName(), contentView .getValue() );
      }
    },
    getVueFile: function(){
      const baseURI = '../static/';
      let fileName = 'Content';

      var parser = CodeParser.parse;
      var me = this;

      if(this.vueFileList[fileName]){
        console.log('that file got already');
        return;
      }

      this.$http.get(`${baseURI}${fileName}.vue`)
        .then((result) => {
          let tmpObj;
          tmpObj = parser(result.data);
          if(!tmpObj){
            Object.assign(me.vueFileList, tmpObj);
          }
      }, (err) => {
        //TODO err proxy 가 가능한지 확인 해야된다. 우선은 axios에서 에러 뱉는게 더 빠름
      });
    }
  },
  mounted() {
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
