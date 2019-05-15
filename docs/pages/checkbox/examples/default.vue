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
    <h5># minus</h5>
    <br>
    <Checkbox
      :value="bindValue6"
      v-model="vModel6"
      :after-type="`minus`"
      class="checkboxStyle"
    >
      Single Circle Minus Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue7"
      v-model="vModel7"
      :after-type="`minus`"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Circle Small Minus Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue8"
      v-model="vModel8"
      :disabled="true"
      :after-type="`minus`"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Circle Small Minus Disabled Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue9"
      v-model="vModel9"
      :type="`square`"
      :after-type="`minus`"
      class="checkboxStyle"
    >
      Single Square Minus Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue100"
      v-model="vModel100"
      :type="`square`"
      :after-type="`minus`"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Square Small Minus Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      v-model="vModel101"
      :disabled="true"
      :type="`square`"
      :after-type="`minus`"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Square Small Minus Disabled Checkbox
    </Checkbox>
    <br>
    <br>
    <br>
    <h5># check</h5>
    <br>
    <Checkbox
      :value="bindValue20"
      v-model="vModel20"
      :after-type="`check`"
      class="checkboxStyle"
    >
      Single Circle Border Check Shape Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue21"
      v-model="vModel21"
      :after-type="`check`"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Circle Border Check Shape Small Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue22"
      v-model="vModel22"
      :disabled="true"
      :after-type="`check`"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Circle Border Check Shape Small Disabled Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue23"
      v-model="vModel23"
      :type="`square`"
      :after-type="`check`"
      class="checkboxStyle"
    >
      Single Square Border Check Shape Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue24"
      v-model="vModel24"
      :type="`square`"
      :after-type="`check`"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Square Border Check Shape Small Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
      :value="bindValue25"
      v-model="vModel25"
      :disabled="true"
      :type="`square`"
      :after-type="`check`"
      :size="`small`"
      class="checkboxStyle"
    >
      Single Square Border Check Shape Small Disabled Checkbox
    </Checkbox>
    <br>
    <br>
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
        bindValue6: 'value06',
        vModel6: false,
        bindValue7: 'value07',
        vModel7: true,
        bindValue8: 'value08',
        vModel8: true,
        bindValue9: 'value09',
        vModel9: true,
        bindValue100: 'value100',
        vModel100: true,
        bindValue101: 'value101',
        vModel101: true,
        bindValue20: 'value20',
        vModel20: true,
        bindValue21: 'value21',
        vModel21: true,
        bindValue22: 'value22',
        vModel22: true,
        bindValue23: 'value23',
        vModel23: true,
        bindValue24: 'value24',
        vModel24: true,
        bindValue25: 'value25',
        vModel25: true,
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
