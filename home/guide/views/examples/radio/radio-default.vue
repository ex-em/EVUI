<template>
  <div>
    <br>
    <h5># Default Radio Button</h5>
    <h6> &nbsp;&nbsp;&nbsp;&nbsp; :radio-id, :radio-value Binding Attrs are required.</h6>
    <br>
    <radio
      :radio-id="`test`"
      :radio-value="`test`"
    />
    <br>
    <br>
    <h5># Default true Radio Button</h5>
    <br>
    <radio
      :radio-id="bindCaseId"
      :radio-value="bindCaseValue"
      :radio-name="bindCaseName"
      v-model="vModelValue"
    />
    <br>
    bind value : {{ vModelValue }}
    <br>
    <br>
    <h5># Default Disabled Radio Button</h5>
    <br>
    <radio
      :radio-id="DisabledCaseId"
      :radio-value="DisabledCaseValue"
      :radio-name="DisabledCaseName"
      :disabled="true"
    />
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
        normalCaseId: 'id01',
        normalCaseValue: 'normalValue',
        normalCaseName: 'name01',
        bindCaseId: 'id02',
        bindCaseValue: 'bindingValue',
        bindCaseName: 'name02',
        vModelValue: 'bindingValue',
        DisabledCaseId: 'id03',
        DisabledCaseValue: 'DisabledValue',
        DisabledCaseName: 'name03',
      };
    },
  };
</script>
<style scoped>
  div{
    display: inline-block;
  }
  p{
    margin-left: 30px;
  }
</style>
