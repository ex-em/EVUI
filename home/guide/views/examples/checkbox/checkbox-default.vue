<template>
  <div>
    <h5># normal</h5>
    <br>
    <Checkbox
      :value="bindValue"
      v-model="vModel"
      class="checkboxStyle"
    >
      Single Checkbox
    </Checkbox>
    <br>
    <br>
    <button
      @click="click"
    >
      test
    </button>
    <br>
    <br>
    bindValue : {{ vModel }}
    <br>
    <br>
    <br>
    <h5># small</h5>
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
    <br>
    <button
      @click="click2"
    >
      test
    </button>
    <br>
    <br>
    bindValue2 : {{ vModel2 }}
    <br>
    <br>
    <br>
    <h5># square</h5>
    <br>
    <Checkbox
      :value="bindValue3"
      v-model="vModel3"
      :type="`square`"
      class="checkboxStyle"
    >
      Single Square Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue4"
      v-model="vModel4"
      :size="`small`"
      :type="`square`"
      class="checkboxStyle"
    >
      Single Small Square Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue5"
      v-model="vModel5"
      :disabled="true"
      :size="`small`"
      :type="`square`"
      class="checkboxStyle"
    >
      Single Small Square Disabled Checkbox
    </Checkbox>
    <br>
    <br>
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
        bindValue3: 'value03',
        vModel3: true,
        bindValue4: 'value04',
        vModel4: false,
        bindValue5: 'value05',
        vModel5: true,
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
