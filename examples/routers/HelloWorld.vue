<template>
  <div>
    {{ value1 }}
    <hello-world></hello-world>
  </div>
</template>
<script>
  import HelloWorld from '@/components/HelloWorld';

  export default {
    components: {
      HelloWorld
    },
    data () {
      return {
        value1: 'value1'
      }
    }
  }
</script>
<style>
</style>
