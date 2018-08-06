<template>
  <div class="btn-small">
    <Button
      :name="name"
      :text="text"
      :is-high-priority="isHighPriority"
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
        name: 'highPriorityBtn',
        text: 'high Priority',
        isHighPriority: true,
      };
    },
  };
</script>
<style scoped>
  .btn-small{
    display: inline-block;
    margin-left: 5px;
    height: 40px;
  }
</style>
