<template>
  <div>
    <br>
    <h5># Default Radio Button</h5>
    <br>
    <radio
      :value="`value01`"
      v-model="bindVModel01"
    >
      single radio
    </radio>
    <br>
    <br>
    <h5># Default Disabled Radio Button</h5>
    <br>
    <radio
      :value="`value02`"
      :disabled="true"
      v-model="bindVModel03"
    >
      disabled single radio
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
      };
    },
  };
</script>

<style scoped>
</style>
