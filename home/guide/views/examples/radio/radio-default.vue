<template>
  <div>
    <br>
    <h5># Default Radio Button</h5>
    <br>
    <radio
      :id="`defaultRadioButtonId01`"
      :value="`value01`"
      v-model="bindVModel01"
    >
      TTTEST1
    </radio>
    <br>
    <br>
    <h5># Default Disabled Radio Button</h5>
    <br>
    <radio
      :id="`disabledRadioButton01`"
      :value="`value02`"
      :disabled="true"
      v-model="bindVModel03"
    >
      disabled selected radio
    </radio>
  </div>
</template>

<script>
  import radio from '@/components/radio/radio';

  export default {
    components: {
      radio,
    },
    data() {
      return {
        bindVModel01: 'value01',
        bindVModel02: 'value02',
        bindVModel03: 'value03',
      };
    },
  };
</script>

<style scoped>
</style>
