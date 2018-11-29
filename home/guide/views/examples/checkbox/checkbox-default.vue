<template>
  <div>
    <Checkbox
      :id="id1"
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
        id1: 'id01',
        value1: 'value01',
        vModel1: true,
      };
    },
  };
</script>

<style scoped>
</style>
