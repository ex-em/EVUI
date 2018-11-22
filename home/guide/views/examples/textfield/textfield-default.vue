<template>
  <div>
    <text-field
      :type="type"
      :placeholder="placeholder"
      :value="value"
      :reg-exp="/([^A-Za-z0-9])+/g"
      :use-reg-exp="true"
      :max-length="20"
      :hide-string="true"
      :use-max-length="true"
      :border-color="borderColor"
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
        value: '',
        // type: 'textarea',
        type: 'input',
        placeholder: 'type something...',
        borderColor: '#dddee1',
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
