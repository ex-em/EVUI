<template>
  <div class="selectbox-group">
    <div class="selectbox-group-left">
      <ev-selectbox
        v-model="selectedValue1"
        :is-group="true"
        :items="items1"
      />
      <br><br>
      value: <span style="font-weight: bold; color: blue;">{{ selectedValue1 }}</span>
    </div>
    <div class="selectbox-group-right">
      <ev-selectbox
        v-model="selectedValue2"
        :is-group="true"
        :multiple="true"
        :items="items2"
      />
      <br><br>
      value: <span style="font-weight: bold; color: blue;">{{ selectedValue2 }}</span>
    </div>
    <br><br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        selectedValue1: 'group_0 > item_1',
        selectedValue2: ['group_1 > item_2'],
        items1: this.getItems(),
        items2: this.getItems(),
      };
    },
    methods: {
      getItems() {
        const itemList = [];
        let groupObj;
        let groupName;
        let value;

        for (let ix = 0; ix < 20; ix++) {
          groupName = `group_${ix}`;
          groupObj = {
            groupName,
            items: [],
          };

          for (let jx = 0; jx < 3; jx++) {
            value = `${groupName} > item_${jx}`;

            groupObj.items.push({
              name: value,
              value,
            });
          }

          itemList.push(groupObj);
        }

        return itemList;
      },
    },
  };
</script>
<style>
  .selectbox-group {
    display: flex;
    width: 100%;
    height: 100%;
    margin-left: 5px;
    font-size: 14px;
  }
  .selectbox-group > .selectbox-group-left {
    width: 320px;
    height: 100%;
  }
  .selectbox-group > .selectbox-group-right {
    flex: 1;
    height: 100%;
  }
</style>
