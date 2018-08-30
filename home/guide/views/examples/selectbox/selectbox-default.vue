<template>
  <div class="selectbox-default">
    <ev-selectbox
      :name="boxInfo.name"
      :selectbox-style="boxInfo.selectboxStyle"
      :init-select="0"
      :items="boxInfo.items"
      @keyup="onKeyUp"
      @select="onSelect"
    />
    <br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        boxInfo: this._getBoxInfo(),
      };
    },
    methods: {
      onSelect(item, target, index) {
        this.selectedItem = item;
        this.index = index;
      },
      onKeyUp(e) {
        this.e = e;
      },
      _getBoxInfo() {
        let boxInfo = {};
        const itemList = [];

        for (let ix = 0, ixLen = 5; ix < ixLen; ix++) {
          itemList.push({
            name: `item${ix}`,
            value: ix,
          });
        }

        boxInfo = {
          name: 'nomalCbBox',
          selectboxStyle: {
            width: '180px',
            height: '30px',
          },
          items: itemList,
        };

        return boxInfo;
      },
    },
  };
</script>
<style>
  .selectbox-default{
    display: inline-block;
    margin-left: 5px;
  }
</style>
