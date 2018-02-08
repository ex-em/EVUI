<template>
  <div>
    {{ value1 }}
    <text-box v-model="value1" size="large" placeholder="large size"></text-box>
  </div>
</template>
<script>
  import TextBox from '@/components/TextBox';

  export default {
    components: {
      TextBox
    },
    data () {
      return {
        value1: 'value3'
      }
    }
  }
</script>
<style>
</style>

