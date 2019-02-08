<template>
  <div class="selectbox-default">
    <ev-selectbox
      ref="selectbox"
      :name="boxInfo.name"
      :style="boxInfo.selectboxStyle"
      :init-select="'item_2'"
      :items="boxInfo.items"
      @keyup="onKeyUp"
      @select="onSelect"
    />
    <ev-button @click="onClickBtn">select value (item_3)</ev-button>
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
      onClickBtn() {
        this.$refs.selectbox.select('item_3');
      },
      _getBoxInfo() {
        let boxInfo = {};
        const itemList = [];
        let value;

        for (let ix = 0, ixLen = 5; ix < ixLen; ix++) {
          value = `item_${ix}`;

          itemList.push({
            name: value,
            value,
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
