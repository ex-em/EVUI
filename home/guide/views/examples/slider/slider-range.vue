<template>
  <div class="slider-default">
    <ev-slider
      :width="900"
      :value="[380, 670]"
      :is-range="true"
      :step="50"
      :min="100"
      :max="800"
    />
    <ev-slider
      :slider-style="{
        marginTop: '20px',
      }"
      :width="1200"
      :value="[27000, 48000]"
      :is-range="true"
      :show-dots="true"
      :step="3300"
      :min="10000"
      :max="80000"
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
    height: 60px;
  }
</style>
