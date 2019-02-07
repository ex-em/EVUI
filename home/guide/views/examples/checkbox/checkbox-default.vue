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
    <Checkbox
      :value="bindValue2"
      v-model="vModel2"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Small Checkbox
    </Checkbox>
    <br>
    <button
      @click="click2"
    >
      test
    </button>
    <br>
    bindValue2 : {{ vModel2 }}
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
        bindValue2: 'value02',
        vModel2: false,
      };
    },
    methods: {
      click() {
        this.vModel = !this.vModel;
      },
      click2() {
        this.vModel2 = !this.vModel2;
      },
    },
  };
</script>

<style scoped>
  .checkboxStyle {
    margin: 0 10px 0 10px;
  }
</style>
