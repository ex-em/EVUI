<template>
  <div>
    <text-field
      :type="type"
      :placeholder="placeholder"
      :value="value"
      :error-msg="'you can write lower letters, upper letter and numbers.'"
      :reg-exp="/([^A-Za-z0-9])+/g"
      :max-length="20"
    />
  </div>
</template>
<script>
  import TextField from '@/components/textfield';

  export default {
    components: {
      TextField,
    },
    data() {
      return {
        value: 'abcd',
        type: 'textarea',
        placeholder: 'test',
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
