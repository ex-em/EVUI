<template>
  <div>
    <Button
      v-for="btnInfo in btnInfoList"
      :key="btnInfo.itemId"
      :name="btnInfo.itemId"
      :customCls="btnInfo.customCls"
      :cls-type="btnInfo.clsType"
      :shape="btnInfo.shape"
      :text="btnInfo.value"
      :menu-list="btnInfo.menuList"
      :disabled="btnInfo.disabled"
      :isLoading="btnInfo.isLoading"
      @btnClick="btnClick"
      @menuItemClick="menuItemClick"
    />
  </div>
</template>

<script>
  import Button from '@/components/button';

  export default {
    components: {
      Button,
    },
    data() {
      return {
        btnInfoList: [
          { itemId: 'originBtn', value: 'origin', customCls: '' },
          { itemId: 'textBtn', value: 'text', clsType: 'text' },
          { itemId: 'defaultBtn', value: 'default' },
          { itemId: 'disabledBtn', value: 'disabled', disabled: true },
          { itemId: 'loadingBtn', value: 'loading', isLoading: true },
          { itemId: 'circleBtn', value: 'circle', shape: 'circle' },
          {
            itemId: 'menuBtn',
            value: 'menu',
            menuList: [
              { text: 'First' },
              { text: 'Second' },
              { text: 'Third' },
            ],
          },
        ],
        event: null,
      };
    },
    methods: {
      btnClick(event, text) {
        this.event = event;
        this.text = text;
      },
      menuItemClick(event, itemId) {
        this.event = event;
        this.itemId = itemId;
      },
    },
  };

</script>
