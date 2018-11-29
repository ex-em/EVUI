<template>
  <div>
    <Checkbox
      :value="value1"
      v-model="vModel1"
    >
      TEST TEXT
    </Checkbox>
    <br>
    <br>
    bindValue : {{ vModel1 }}
  </div>
</template>
<script>
  import Checkbox from '@/components/checkbox/checkbox';

  export default {
    components: {
      Checkbox,
    },
    data() {
      return {
        value1: 'value01',
        vModel1: true,
      };
    },
  };
</script>

<style scoped>
</style>
