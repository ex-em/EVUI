<template>
  <div class="btn-disabled">
    <Button
      :name="btnInfo.name"
      :text="btnInfo.text"
      :disabled="btnInfo.disabled"
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
          name: 'disabledBtn',
          text: 'disabled',
          disabled: true,
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
  .btn-disabled{
    display: inline-block;
    margin-left: 5px;
  }
</style>
