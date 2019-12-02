<template>
  <div>
    <div>
      <inputNumber
        :value="100"
        :step="3"
        :precision="0"
        :width="'30%'"
        :parser="parser"
      />
    </div>
    <div>
      <inputNumber
        :value="345"
        :step="3"
        :precision="2"
        :width="'100'"
      />
    </div>
    <div>
      <inputNumber
        :step="1"
        :precision="2"
        :width="'10%'"
        :parser="parser"
      />
    </div>
    <div>
      <inputNumber
        :value="345"
        :step="0.4"
        :precision="3"
        :width="'20%'"
        :parser="parser"
        :readonly="true"
      />
    </div>
    <div>
      <inputNumber
        :value="1"
        :step="1"
        :precision="5"
        :width="'30%'"
        :max="10"
        :min="0"
        :disabled="true"
      />
    </div>
  </div>
</template>

<script>
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

<style lang="scss">
  @import '~@/styles/default';
</style>
