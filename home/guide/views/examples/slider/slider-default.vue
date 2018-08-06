<template>
  <div class="slider-default">
    <Slider :value="70"/>
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
    height: 26px;
  }
</style>
