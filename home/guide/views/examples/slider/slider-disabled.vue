<template>
  <div class="slider-disabled">
    <ev-slider
      :width="300"
      :value="58"
      :disabled="true"
    />
  </div>
</template>

<script>
  export default {
    name: 'SliderDisabled',
  };
</script>

<style scoped>
  .slider-disabled{
    padding: 10px 5px 0 5px;
    height: 26px;
  }
</style>
