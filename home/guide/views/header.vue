<template>
  <div class="evui-main-header">
    <div class="evui-header-title">
      <a href="/">
        <img src="http://evui.ex-em.com/wp-content/uploads/2017/11/evui_1.png">
        <div>EXEM Visualization UI</div>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    model: {
    },
    props: {
    },
    data() {
      return {
      };
    },
    computed: {
    },
    methods: {
    },
  };
</script>

<style scoped>
  a, span {
    text-decoration: none !important;
  }
  a:visited {
    color: #000;
  }
  .evui-main-header {
    display: table;
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 55px;
    background: #67A1F4;
    z-index: 30000;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }
  .evui-header-title {
    display: table-cell;
    vertical-align: middle;
  }
  .evui-header-title > a {
    display: table;
  }
  .evui-header-title > a > img{
    display: table-cell;
  }
  .evui-header-title > a > div{
    display: table-cell;
    vertical-align: middle;
    padding-left: 10px;
    color: rgb(43,87,151);
    font-size: 15px;
    font-weight: bold;
  }
</style>
