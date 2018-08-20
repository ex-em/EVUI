<template>
  <div>
    <tab
      v-model="a"
    />
  </div>
</template>
<script>
  import tab from '@/components/tab/tab';

  export default {
    components: {
      tab,
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
