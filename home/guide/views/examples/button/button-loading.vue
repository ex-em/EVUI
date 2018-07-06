<template>
  <div class="btn-loading">
    <Button
      :name="btnInfo.name"
      :text="btnInfo.text"
      :is-loading="btnInfo.isLoading"
      @click="onClick"
      @item-click="onItemClick"
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
        btnInfo: {
          name: 'loadingBtn',
          text: 'loading',
          isLoading: true,
        },
      };
    },
    methods: {
      onClick(event, text) {
        this.event = event;
        this.text = text;
      },
      onItemClick(event, itemId) {
        this.event = event;
        this.itemId = itemId;
      },
    },
  };
</script>
<style scoped>
  .btn-loading{
    display: inline-block;
    margin-left: 5px;
  }
</style>
