<template>
  <div class="slider-dots">
    <ev-slider
      :width="1200"
      :value="200"
      :show-dots="true"
      :step="10"
      :min="100"
      :max="800"
    />
  </div>
</template>

<script>
  export default {
    name: 'SliderDots',
  };
</script>

<style scoped>
  .slider-dots{
    padding: 10px 5px 0 5px;
    height: 26px;
  }
</style>
