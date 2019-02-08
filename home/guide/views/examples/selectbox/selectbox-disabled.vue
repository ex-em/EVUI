<template>
  <div class="selectbox-disabled">
    <ev-selectbox
      v-model="selectedValue"
      :name="boxInfo.name"
      :style="boxInfo.selectboxStyle"
      :init-select-idx="0"
      :items="boxInfo.items"
      :disabled="boxInfo.disabled"
    />
    <br><br>
    selected value : <span style="font-weight: bold; color: blue;">{{ selectedValue }}</span>
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
      _getBoxInfo() {
        const itemList = [];
        let boxInfo = {};
        let value;

        for (let ix = 0, ixLen = 10; ix < ixLen; ix++) {
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
          disabled: true,
        };

        return boxInfo;
      },
    },
  };
</script>
<style>
  .selectbox-disabled{
    display: inline-block;
    margin-left: 5px;
  }
</style>
