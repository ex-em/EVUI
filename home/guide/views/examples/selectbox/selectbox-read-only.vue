<template>
  <div class="selectbox-read-only">
    <ev-selectbox
      ref="selectbox"
      v-model="selectedValue"
      :read-only="true"
      :init-select="'item_2'"
      :items="items"
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
        selectedValue: '',
        items: this.getItems(),
      };
    },
    methods: {
      getItems() {
        const itemList = [];
        let value;

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
  .selectbox-read-only{
    display: inline-block;
    margin-left: 5px;
    font-size: 14px;
  }
</style>
