<template>
  <div>
    <div class="label-demo">
      <h5> # Normal </h5>
      <Label/>
    </div>
  </div>
</template>
<script>
  import Label from '@/components/label/label';

  export default {
    components: {
      Label,
    },
    data() {
      return {
      };
    },
  };
</script>
<style scoped>
  div{
    padding: 3px;
  }
  p{
    margin: 2px;
  }
  .label-demo {
    width: 30%;
  }
</style>
