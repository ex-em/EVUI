<template>
  <div>
    <Button
      v-for="btnInfo in btnInfoList"
      :key="btnInfo.name"
      :name="btnInfo.name"
      :cls-type="btnInfo.clsType"
      :custom-cls="btnInfo.customCls"
      :shape="btnInfo.shape"
      :text="btnInfo.text"
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
          { name: 'originBtn', text: 'origin', customCls: '' },
          { name: 'textBtn', text: 'text', clsType: 'text' },
          { name: 'defaultBtn', text: 'default' },
          { name: 'disabledBtn', text: 'disabled', disabled: true },
          { name: 'loadingBtn', text: 'loading', isLoading: true },
          { name: 'circleBtn', text: 'circle', shape: 'circle' },
          {
            name: 'menuBtn',
            text: 'menu',
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
