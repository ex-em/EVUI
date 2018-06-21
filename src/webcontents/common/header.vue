<template>
  <div class="evui-main-header">
    <div class="evui-header-title">
      <a href="/">
        <img src="http://evui.ex-em.com/wp-content/uploads/2017/11/evui_1.png">
        <span>EXEM Visualization UI</span>
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
  .evui-main-header {
    display: table;
    position: fixed;
    background: #999;
    width: 100%;
    height: 70px;
    top: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }
  .evui-header-title {
    vertical-align: middle;
    display: table-cell;
  }
</style>
