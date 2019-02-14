<template>
  <div class="selectbox-multiple">
    <ev-selectbox
      v-model="selectedValue"
      :name="boxInfo.name"
      :multiple="boxInfo.multiple"
      :init-select-idx="0"
      :items="boxInfo.items"
    />
    <br><br>
    value: <span style="font-weight: bold; color: blue;">{{ selectedValue }}</span>
    <br><br><br><br><br><br><br><br><br><br><br><br><br>
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
        let boxInfo = {};
        const itemList = [];
        let value;

        for (let ix = 0, ixLen = 100; ix < ixLen; ix++) {
          value = `item_${ix}`;

          itemList.push({
            name: value,
            value,
          });
        }

        boxInfo = {
          name: 'nomalCbBox',
          multiple: true,
          items: itemList,
        };

        return boxInfo;
      },
    },
  };
</script>
<style>
  .selectbox-multiple{
    display: inline-block;
    margin-left: 5px;
    font-size: 14px;
  }
</style>
