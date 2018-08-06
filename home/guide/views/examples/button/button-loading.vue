<template>
  <div class="btn-loading">
    <Button
      :name="name"
      :text="text"
      :type="type"
      :is-loading="isLoading"
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
        name: 'loadingBtn',
        text: 'loading',
        type: 'primary',
        isLoading: true,
      };
    },
  };
</script>

<style scoped>
  .btn-loading{
    display: inline-block;
    margin-left: 5px;
    height: 40px;
  }
</style>
