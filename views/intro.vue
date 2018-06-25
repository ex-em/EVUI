<template>
  <div class="evui-summary">
    <div class="evui-summary-header">
      <h1>
        <i class="far fa-list-alt"/> Guide Summary
      </h1>
      <br>
      <p>
        EVUI는 웹페이지의 핵심 구성요소인 Grid/Chart 컴포넌트를 제공하는 UI 프레임워크입니다.<br>
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
    height: 50px;
  }
  .evui-summary-header h1 {
    font-size: 20px;
  }
  .evui-summary-content {
    margin-top: 50px;
  }
  .evui-summary-thumbnail-content {
    margin-bottom: 25px;
  }
  .evui-summary-thumbnail-title {
    height: 25px;
    width: calc(100% - 100px);
    border-bottom: 2px solid #2d8cf0;
    cursor: pointer;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 800;
  }
  .evui-summary-thumbnail-ul {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 0 0px 0 10px;
  }
  .evui-summary-thumbnail-ul:after {
    flex: auto;
  }
  .evui-summary-thumbnail-li {
    list-style: none;
    float: left;
    width: calc(16.6% - 23px);
    margin: 10px;
    box-shadow: 0 0 4px 4px rgba(0,0,0,0.1);
    word-wrap: break-word;
  }
  .evui-summary-thumbnail-li:hover {
    -webkit-transform: scale(1.05);
    transform: scale(1.05);
    cursor: pointer;
  }
  .evui-summary-thumbnail-li h3 {
    padding: 5px 10px 5px 10px;
  }
  .evui-summary-thumbnail-li h4 {
    padding: 5px 10px 5px 10px;
  }
  .evui-summary-thumbnail-box-image img {
    border: 1px solid #eeeeee;
    object-fit: cover;
    width: 100%;
    height: 150px;
    margin-left: -1px;
    margin-top: -1px;
  }

  @media all and (max-width: 1400px) {
    .evui-summary-thumbnail-li{
      list-style: none;
      width: calc(25% - 23px);
      margin: 10px;
    }
  }
  @media all and (max-width: 900px) {
    .evui-summary-thumbnail-li{
      list-style: none;
      width: calc(50% - 23px);
      margin: 10px;
    }
  }
  @media all and (max-width: 600px) {
    .evui-summary-thumbnail-li{
      list-style: none;
      width: calc(100% - 23px);
    }
  }
</style>

