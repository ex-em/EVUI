<template>
  <div class="selectbox-default">
    <ev-selectbox
      ref="selectbox"
      v-model="selectedValue"
      :init-select="'item_1'"
      :items="items"
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
        selectedValue: '',
        items: this.getItems(),
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
      getItems() {
        let value;
        const itemList = [];

        for (let ix = 0; ix < 5; ix++) {
          value = `item_${ix}`;

          itemList.push({
            name: value,
            value,
          });
        }

        return itemList;
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
