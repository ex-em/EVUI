<template>
  <div>
    <Checkbox
      :checkbox-id="bindCaseId"
      :checkbox-value="bindCaseValue"
      :checkbox-name="bindCaseName"
      v-model="vModelValue"
    />
    <br>
    <Checkbox
      :checkbox-id="bindCaseId2"
      :checkbox-value="bindCaseValue2"
      :checkbox-name="bindCaseName2"
      v-model="vModelValue"
    />
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
        bindCaseId: 'id021',
        bindCaseValue: 'bindingValue1',
        bindCaseName: 'name021',
        vModelValue: 'bindingValue1',
        bindCaseId2: 'id022',
        bindCaseValue2: 'bindingValue2',
        bindCaseName2: 'name022',
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
