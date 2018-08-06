<template>
  <div>
    <Button
      v-for="btn in btnList"
      :key="btn.name"
      :name="btn.name"
      :text="btn.text"
      :type="btn.type"
      :size="btn.size"
      :shape="btn.shape"
      :btn-style="btn.btnStyle"
      :disabled="btn.disabled"
      :isLoading="btn.isLoading"
      :is-high-priority="btn.isHighPriority"
      :menu-list="btn.menuList"
      @click="onClick"
      @item-click="itemClick"
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
        btnList: [],
        event: null,
      };
    },
    mounted() {
      this.btnList = this.getBtnList();
    },
    methods: {
      onClick(event, text) {
        this.event = event;
        this.text = text;
      },
      itemClick(event, itemId) {
        this.event = event;
        this.itemId = itemId;
      },
      getBtnList() {
        let btn;
        const btnList = [
          { text: 'origin', name: 'originBtn', type: '' },
          { text: 'default', name: 'defaultBtn' },
          { text: 'primary', name: 'primaryBtn', type: 'primary' },
          { text: 'small', name: 'smallBtn', type: 'primary', size: 'small' },
          { text: 'normal', name: 'normalBtn', type: 'primary', size: 'normal' },
          { text: 'large', name: 'largeBtn', type: 'primary', size: 'large' },
          { text: 'high Priority', name: 'highPriorityBtn', isHighPriority: true },
          { text: 'ghost', name: 'ghostBtn', type: 'ghost' },
          { text: 'dashed', name: 'dashedBtn', type: 'dashed' },
          { text: 'text', name: 'textBtn', type: 'text' },
          { text: 'circle', name: 'circleBtn', type: 'primary', shape: 'circle' },
          { text: 'disabled', name: 'disabledBtn', type: 'primary', disabled: true },
          { text: 'loading', name: 'loadingnormalBtn', type: 'primary', isLoading: true },
          {
            text: 'menu',
            name: 'menuBtn',
            type: 'primary',
            size: 'normal',
            menuList: [
              { text: 'First' },
              { text: 'Second' },
              { text: 'Third' },
            ],
          },
        ];

        for (let ix = 0, ixLen = btnList.length; ix < ixLen; ix++) {
          btn = btnList[ix];

          if (ix > 0) {
            btn.btnStyle = {
              marginLeft: '4px',
            };
          }
        }

        return btnList;
      },
    },
  };

</script>
