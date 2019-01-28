<template>
  <div>
    <Checkbox
      :value="bindValue"
      v-model="vModel"
      class="checkboxStyle"
    >
      Single Checkbox
    </Checkbox>
    <br>
    <button
      @click="click"
    >
      test
    </button>
    <br>
    bindValue : {{ vModel }}
    <br>
    <br>
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
        bindValue: 'value01',
        vModel: true,
      };
    },
    methods: {
      click() {
        this.vModel = !this.vModel;
      },
    },
  };
</script>

<style scoped>
  .checkboxStyle {
    margin: 0 10px 0 10px;
  }
</style>
