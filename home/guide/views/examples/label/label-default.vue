<template>
  <div>
    <div
      class="label-demo"
      style="width: 500px; height: 500px;"
    >
      <Label
        :refs="'label1'"
        :value="labelValue"
        :bold="true"
        :width="width"
        :height="height"
        :textAlign="textAlign"
        :verticalAlign="verticalAlign"
      />
    </div>
  </div>
</template>
<script>
  import Label from '@/components/label/label';
  import Button from '@/components/button';
  import inputNumber from '@/components/input/input.number';

  export default {
    components: {
      Label,
      Button,
      inputNumber,
    },
    data() {
      return {
        width: '100%',
        height: '100%',
        labelValue: 'Normalasdfasdf',
        checkItem: false,
        textAlign: 'left',
        verticalAlign: 'middle',
      };
    },
    mounted() {
    },
    methods: {
    },
  };
</script>
<style scoped>
</style>
