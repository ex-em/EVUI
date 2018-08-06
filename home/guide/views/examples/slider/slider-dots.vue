<template>
  <div class="slider-dots">
    <Slider
      :value="200"
      :show-dots="true"
      :step="10"
      :min="100"
      :max="800"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import Slider from '@/components/slider';

  export default {
    name: 'SliderDots',
    components: {
      Slider,
    },
  };
</script>

<style scoped>
  .slider-dots{
    padding: 10px 5px 0 5px;
    height: 26px;
  }
</style>
