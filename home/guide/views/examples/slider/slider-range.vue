<template>
  <div class="slider-default">
    <Slider
      :value="[380, 670]"
      :is-range="true"
      :step="50"
      :min="100"
      :max="800"
    />
    <Slider
      :slider-style="{
        marginTop: '20px',
      }"
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
  import '@/styles/evui.css';
  import Slider from '@/components/slider';

  export default {
    name: 'SliderDefault',
    components: {
      Slider,
    },
  };
</script>

<style scoped>
  .slider-default{
    padding: 10px 5px 0 5px;
    height: 60px;
  }
</style>
