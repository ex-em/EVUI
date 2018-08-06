<template>
  <div>
    <Slider
      v-for="slider in sliderList"
      :key="slider.name"
      :name="slider.name"
      :value="slider.value"
      :max="slider.max"
      :min="slider.min"
      :is-range="slider.isRange"
      :show-dots="slider.showDots"
      :dot-step="slider.dotStep"
      :disabled="slider.disabled"
    />
  </div>
</template>

<script>
  import Slider from '@/components/slider';

  export default {
    components: {
      Slider,
    },
    data() {
      return {
        sliderList: [],
      };
    },
    mounted() {
      this.sliderList = this.getSliderList();
    },
    methods: {
      getSliderList() {
        return [
          { name: 's1', value: 20 },
          { name: 's2', value: 10, showDots: true, step: 10 },
          { name: 't2', value: [10, 30], isRange: true },
          { name: 't3', value: [10, 30], isRange: true, min: 400, max: 1000 },
          { name: 't4', value: [20, 40], isRange: true, showDots: true, step: 10 },
          { name: 't5', value: [60, 80], isRange: true, showDots: true, step: 10, disabled: true },
        ];
      },
    },
  };

</script>
