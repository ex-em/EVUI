<template>
  <div class="selectbox-multiple">
    <ev-selectbox
      :name="boxInfo.name"
      :style="boxInfo.selectboxStyle"
      :multiple="boxInfo.multiple"
      :init-select-idx="0"
      :items="boxInfo.items"
    />
    <br><br><br><br><br><br><br><br><br><br><br><br><br>
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
          selectboxStyle: {
            width: '180px',
            height: '30px',
          },
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
  }
</style>
