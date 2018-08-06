<template>
  <div class="slider-disabled">
    <Slider
      :value="58"
      :disabled="true"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import Slider from '@/components/slider';

  export default {
    name: 'SliderDisabled',
    components: {
      Slider,
    },
  };
</script>

<style scoped>
  .slider-disabled{
    padding: 10px 5px 0 5px;
    height: 26px;
  }
</style>
