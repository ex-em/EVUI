<template>
  <div>
    <Checkbox
      :id="bindCaseId"
      :label="bindCaseLabel"
      :checked="false"
    />
    <br>
    <br>
    <Checkbox
      :id="bindCaseId2"
      :label="bindCaseLabel2"
      :checked="true"
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
        bindCaseLabel: 'name021',
        bindCaseId2: 'id022',
        bindCaseLabel2: 'name022',
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
