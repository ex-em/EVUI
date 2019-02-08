<template>
  <div class="selectbox-read-only">
    <ev-selectbox
      ref="selectbox"
      v-model="selectedValue"
      :style="boxInfo.selectboxStyle"
      :read-only="true"
      :init-select="'item_2'"
      :items="boxInfo.items"
    />
    <br><br>
    selected value: <span style="font-weight: bold; color: blue;">{{ selectedValue }}</span>
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
  .selectbox-read-only{
    display: inline-block;
    margin-left: 5px;
  }
</style>
