<template>
  <div class="slider-default">
    <ev-slider
      :width="200"
      :value="70"
    />
  </div>
</template>

<script>
  export default {
    name: 'SliderDefault',
  };
</script>

<style scoped>
  .slider-default{
    padding: 10px 5px 0 5px;
    height: 26px;
  }
</style>
