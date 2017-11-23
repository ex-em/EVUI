<template>
  <div id="content" class="content">
    <cmp-Summary v-show="isMainView"></cmp-Summary>
    <cmp-source v-show="!isMainView" :fileList="fileList"></cmp-source>
    <cmp-result v-show="!isMainView" :fileList="fileList"></cmp-result>
  </div>
</template>

<script>
  import GuideSummary from './GuideSummary.vue';
  import GuideSource from './GuideSource.vue';
  import GuideResult from './GuideResult.vue';

  export default {
    components: {
      'cmpSummary': GuideSummary,
      'cmpSource': GuideSource,
      'cmpResult': GuideResult
    },
    props: [
      'fileList'
    ],
    data() {
      return {

      }
    },
    computed:{
      initText: function(){
        return {
          value : `EVUI는 웹페이지의 핵심 구성요소인 Grid/Chart 컴포넌트를 제공하는 UI 프레임워크입니다.
                EVUI Grid와 Chart는 HTML/CSS/JS 및 SVG로 구현되어 있어 다양한 환경에 적용이 가능하며,
                Vue.JS를 기반으로 구현되어 대량의 데이터를 고속으로 처리합니다.`
        }
      },
      isMainView(){
        let delimiter = '/guide';
        let routePath = this.$route.path;
        let findIdx   = routePath.indexOf(delimiter);

        routePath = routePath.slice(findIdx+delimiter.length, routePath.length);

        return  routePath.length == 0 || routePath == '/' ? true : false;
      }
    },
    methods: {
    },
    mounted() {
    }
  }
</script>


<style scoped>
</style>
