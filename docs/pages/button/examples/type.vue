<template>
  <div class="btn-type">
    <ev-button>default</ev-button>
    <ev-button :type="'primary'">primary</ev-button>
    <ev-button :type="'ghost'">ghost</ev-button>
    <ev-button :type="'dashed'">dashed</ev-button>
    <ev-button :type="'text'">text</ev-button>
  </div>
</template>

<script>
  export default {};
</script>

<style>
  .btn-type{
    display: inline-block;
    margin: 5px;
    height: 40px;
  }
</style>
