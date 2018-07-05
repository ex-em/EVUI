<template>
  <div>
    <radio
      v-model="baseRadio.bool"
      :label="baseRadio.label"
    />
    <p>{{ baseRadio.bool }}</p>
  </div>
</template>
<script>
  import radio from '@/components/radio/radio';

  export default {
    components: {
      radio,
    },
    data() {
      return {
        baseRadio: {
            bool: false,
            label: 'Normal',
          },
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
