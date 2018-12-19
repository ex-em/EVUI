<template>
  <div>
    <div
      class="label-demo"
      style="width: 500px; height: 500px;"
    >
      <Label
        :ref="'label1'"
        :value="labelValue"
        :width="width"
        :height="height"
        :textAlign="textAlign"
        :verticalAlign="verticalAlign"
      />
      <Label
        :ref="'label1'"
        :value="labelValue"
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
        width: '40%',
        height: '100%',
        labelValue: 'Normalasdfasdf',
        checkItem: false,
        textAlign: 'left',
        verticalAlign: 'middle',
      };
    },
    mounted() {
      // this.timer = setTimeout(() => { this.updateData(); }, 3000);
    },
    methods: {
      updateData() {
        this.labelValue = 'asdjfkasdjfkasdjfk';
        this.textAlign = 'right';
        this.verticalAlign = 'bottom';
        // this.height = 200;

        if (this.timer) {
          clearTimeout(this.timer);
        }
      },
    },
  };
</script>
<style scoped>
</style>
