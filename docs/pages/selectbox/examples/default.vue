<template>
  <div class="selectbox-default">
    <ev-selectbox
      v-model="selectedValue"
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
        selectedValue: 1,
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
        this.selectedValue = 3;
      },
      getItems() {
        const itemList = [];

        for (let ix = 0; ix < 5; ix++) {
          itemList.push({
            name: `item_${ix}`,
            value: ix,
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
