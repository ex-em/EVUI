<template>
  <div class="selectbox-multiple">
    <ev-selectbox
      v-model="selectedValue"
      :multiple="true"
      :items="items"
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
        selectedValue: ['item_0'],
        items: this.getItems(),
      };
    },
    methods: {
      getItems() {
        const itemList = [];
        let value;

        for (let ix = 0; ix < 100; ix++) {
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
  .selectbox-multiple{
    display: inline-block;
    margin-left: 5px;
    font-size: 14px;
  }
</style>
