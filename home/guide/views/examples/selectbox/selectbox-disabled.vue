<template>
  <div class="selectbox-disabled">
    <ev-selectbox
      v-model="selectedValue"
      :disabled="true"
      :init-select-idx="0"
      :items="items"
    />
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
      getItems() {
        const itemList = [];
        let value;

        for (let ix = 0; ix < 10; ix++) {
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
  .selectbox-disabled{
    display: inline-block;
    margin-left: 5px;
    font-size: 14px;
  }
</style>
