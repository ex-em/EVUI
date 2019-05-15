<template>
  <div>
    <text-field
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :reg-exp="/([^A-Za-z0-9])+/g"
      :use-reg-exp="true"
      :max-length="20"
      :use-max-length="true"
      :border-color="borderColor"
      @input="onInput"
    />
    <text-field
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :reg-exp="/([^A-Za-z0-9])+/g"
      :use-reg-exp="true"
      :max-length="20"
      :use-max-length="true"
      :border-color="borderColor"
      :disabled="true"
      @input="onInput"
    />
    <text-field
      v-model="value"
      :type="'password'"
      :placeholder="placeholder"
      :reg-exp="/([^A-Za-z0-9])+/g"
      :use-reg-exp="true"
      :max-length="20"
      :use-max-length="true"
      :border-color="borderColor"
      :height="200"
      @input="onInput"
    />
    <text-field
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :reg-exp="/([^A-Za-z0-9])+/g"
      :use-reg-exp="true"
      :max-length="20"
      :use-max-length="true"
      :border-color="borderColor"
      :disabled="true"
      :height="200"
      @input="onInput"
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
        value: '131231',
        type: 'text',
        placeholder: 'type something...',
        borderColor: '#dddee1',
      };
    },
    methods: {
      onInput(v) {
        console.log(v);
      },
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
