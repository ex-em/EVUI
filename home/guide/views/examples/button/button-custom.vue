<template>
  <div class="btn-custom">
    <Button
      :name="btnInfo.name"
      :text="btnInfo.text"
      :custom-cls="btnInfo.customCls"
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
          name: 'customBtn',
          text: 'custom',
          customCls: '',
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
  .btn-custom{
    display: inline-block;
    margin-left: 5px;
  }
</style>
