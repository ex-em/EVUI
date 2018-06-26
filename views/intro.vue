<template>
  <div class="evui-summary">
    <div class="evui-summary-header">
      <h1>
        <i class="far fa-list-alt"/> Guide Summary
      </h1>
      <br>
      <p>
        EVUI는 웹페이지의 핵심 구성요소인 Grid/Chart 컴포넌트를 제공하는 UI 프레임워크입니다.<br><br>
        EVUI Grid와 Chart는 HTML/CSS/JS 및 SVG로 구현되어 있어 다양한 환경에 적용이 가능하며,
        Vue.JS를 기반으로 구현되어 대량의 데이터를 고속으로 처리합니다.
      </p>
    </div>
    <thumb-summary
      :totalStore="store"
      @clickSummary="selectedSummary"
    />
  </div>
</template>

<script>
  import thumbSummary from '../views/summary';

  export default {
    components: {
      thumbSummary,
    },
    props: {
      store: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
      }
    },
    computed: {
    },
    methods: {
      selectedSummary(parentName, childName, index) {
        this.$emit('selectedSummary', parentName, childName, index);
      },
    },
  };
</script>

<style>
  .evui-summary-header {
    height: auto;
  }
  .evui-summary-header h1 {
    font-size: 20px;
  }
</style>

