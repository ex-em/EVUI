<template>
  <div class="btn-disabled">
    <Button
      :name="name"
      :text="text"
      :disabled="disabled"
    />
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import Button from '@/components/button';

  export default {
    components: {
      Button,
    },
    data() {
      return {
        name: 'disabledBtn',
        text: 'disabled',
        disabled: true,
      };
    },
  };
</script>
<style scoped>
  .btn-disabled{
    display: inline-block;
    margin-left: 5px;
    height: 40px;
  }
</style>
