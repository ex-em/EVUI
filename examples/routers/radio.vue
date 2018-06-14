<template>
  <div>
    <p>{{ label }}</p>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import Radio from '@/components/radio/radio';
  import RadioGroup from '@/components/radio/radio-group';

  export default {
    component: {
      Radio,
      RadioGroup,
    },
    data() {
      return {
        label: 'label',
      };
    },
  };
</script>
<style>
</style>
