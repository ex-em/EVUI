<template>
  <div>
    <inputNumber
      :value="100"
      :step="3"
      :precision="0"
      :width="'30%'"
      :parser="parser"
    />
    <inputNumber
      :value="345"
      :step="3"
      :precision="2"
      :width="'100'"
    />
    <inputNumber
      :step="1"
      :precision="2"
      :width="'100%'"
      :parser="parser"
    />
    <inputNumber
      :value="345"
      :step="0.4"
      :precision="3"
      :width="'20%'"
      :parser="parser"
      :readonly="true"
    />
    <inputNumber
      :value="1"
      :step="1"
      :precision="5"
      :width="'40%'"
      :max="10"
      :min="0"
      :disabled="true"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import inputNumber from '@/components/input/input.number';

  export default {
    name: 'InputNumber',
    components: {
      inputNumber,
    },
    data() {
      return {
        parser: value => value,
        formatter1: null,
        formatter2: value => value.concat('%'),
      };
    },
    methods: {
    },
  };
</script>

<style scoped>
</style>
