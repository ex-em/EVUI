<template>
  <div>
    <div>
      <input-number/>
    </div>
  </div>
</template>
<script>
  import checkbox from '@/components/checkbox/checkbox';
  import inputNumber from '@/components/input/input.number';

  export default {
    components: {
      checkbox,
      inputNumber,
    },
    data() {
      return {
      };
    },
  };
</script>
<style scoped>
  div{
    display: inline-block;
  }
  p{
    margin-left: 30px;
  }
</style>
