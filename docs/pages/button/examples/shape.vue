<template>
  <div class="btn-shape">
    <ev-button :type="'primary'">
      default
    </ev-button>
    <ev-button
      :type="'primary'"
      :shape="'radius'"
    >
      radius
    </ev-button>
    <ev-button
      :type="'primary'"
      :shape="'circle'"
    >
      circle
    </ev-button>
  </div>
</template>

<script>
  export default {};
</script>

<style>
  .btn-shape{
    display: inline-block;
    margin: 5px;
    height: 40px;
  }
</style>
