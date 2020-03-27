<template>
  <div>
    <h5># normal</h5>
    <br>
    <Checkbox
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
      CLICK
    </button>
    {{ vModel }}
    <br>
    <br>
    <br>
    <h5># small</h5>
    <br>
    <Checkbox
      v-model="vModel2"
      :value="stringCustomValue"
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
      CLICK
    </button>
    {{ vModel2 }}
    <br>
    <br>
    <br>
    <h5># square</h5>
    <br>
    <Checkbox
      v-model="vModel3"
      :type="`square`"
      class="checkboxStyle"
    >
      Single Square Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
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
      v-model="vModel6"
      :after-type="`minus`"
      class="checkboxStyle"
    >
      Single Circle Minus Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
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
      v-model="vModel20"
      :after-type="`check`"
      class="checkboxStyle"
    >
      Single Circle Border Check Shape Checkbox
    </Checkbox>
    <br>
    <br>
    <Checkbox
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
        stringCustomValue: 'value',
        vModel: true,
        vModel2: false,
        vModel3: true,
        vModel4: false,
        vModel5: true,
        vModel6: false,
        vModel7: true,
        vModel8: true,
        vModel9: true,
        vModel100: true,
        vModel101: true,
        vModel20: true,
        vModel21: true,
        vModel22: true,
        vModel23: true,
        vModel24: true,
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
