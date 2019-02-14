<template>
  <div class="selectbox-default">
    <ev-selectbox
      ref="selectbox"
      v-model="selectedValue"
      :name="boxInfo.name"
      :init-select="'item_1'"
      :items="boxInfo.items"
      @keyup="onKeyUp"
      @select="onSelect"
    />
    <ev-button
      :size="'small'"
      @click="onClickBtn"
    >
      select value (item_3)
    </ev-button>
    <br><br>
    value: <span style="font-weight: bold; color: blue;">{{ selectedValue }}</span>
    <br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        boxInfo: this._getBoxInfo(),
        selectedValue: '',
      };
    },
    methods: {
      onSelect(item, target, index) {
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
    font-size: 14px;
  }
</style>
