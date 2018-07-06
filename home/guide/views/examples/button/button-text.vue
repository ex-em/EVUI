<template>
  <div class="btn-text">
    <Button
      :name="btnInfo.name"
      :text="btnInfo.text"
      :cls-type="btnInfo.clsType"
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
          name: 'textBtn',
          text: 'text',
          clsType: 'text',
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
  .btn-text{
    display: inline-block;
    margin-left: 5px;
  }
</style>
