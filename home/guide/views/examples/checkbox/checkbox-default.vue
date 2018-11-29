<template>
  <div>
    <Checkbox
      :id="id1"
      :value="value1"
      v-model="vModel1"
    >
      CHECK TEST 01
    </Checkbox>
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
  div{
    display: inline-block;
  }
  p{
    margin-left: 30px;
  }
</style>
