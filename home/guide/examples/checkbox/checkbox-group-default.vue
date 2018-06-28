<template>
  <div>
    <checkbox/>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';
  import checkboxGroup from '@/components/checkbox/checkbox-group';

  export default {
    components: {
      checkbox,
      checkboxGroup,
    },
    data() {
      return {
        baseCheck: [false, false, true, true, true],
      };
    },
  };
</script>
<style scoped>
  h4 {
    color: mediumseagreen;
  }
  h5 {
    color: darkorange;
  }
</style>
