<template>
  <div>
    <br>
    <h5># Default Radio Button</h5>
    <br>
    <radio
      :value="`value01`"
      v-model="bindVModel01"
    >
      Single Radio
    </radio>
    <br>
    <br>
    <h5># Default Disabled Radio Button</h5>
    <br>
    <radio
      :value="`value02`"
      :disabled="true"
      v-model="bindVModel02"
    >
      Disabled Single Radio
    </radio>
    <br>
    <br>
    <h5># Default Small Radio Button</h5>
    <br>
    <radio
      :value="`value02`"
      :size="`small`"
      v-model="bindVModel03"
    >
      <p
        style="font-size: 12px;"
      >
        Small Single Radio
      </p>
    </radio>
    <br>
    <br>
    <h5># Default Disabled Small Radio Button</h5>
    <br>
    <radio
      :value="`value04`"
      :disabled="true"
      :size="`small`"
      v-model="bindVModel04"
    >
      <p
        style="font-size: 12px;"
      >
        Small Single Radio
      </p>
    </radio>
    <br>
    <br>
    <br>
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
        bindVModel04: 'value04',
      };
    },
  };
</script>

<style scoped>
</style>
