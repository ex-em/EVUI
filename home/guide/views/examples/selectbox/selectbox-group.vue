<template>
  <div class="selectbox-group">
    <div class="selectbox-group-left">
      <ev-selectbox
        v-model="selectedValue1"
        :name="'groupCbBox'"
        :is-group="true"
        :init-select-idx="3"
        :items="getGroupItemList()"
      />
      <br><br>
      value: <span style="font-weight: bold; color: blue;">{{ selectedValue1 }}</span>
    </div>
    <div class="selectbox-group-right">
      <ev-selectbox
        v-model="selectedValue2"
        :name="'groupMultipleCbBox'"
        :is-group="true"
        :multiple="true"
        :init-select-idx="3"
        :items="getGroupItemList()"
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
        selectedValue1: '',
        selectedValue2: '',
      };
    },
    methods: {
      getGroupItemList() {
        const itemList = [];
        let groupObj;
        let groupName;
        let value;

        for (let ix = 0, ixLen = 20; ix < ixLen; ix++) {
          groupName = `group_${ix}`;
          groupObj = {
            groupName,
            items: [],
          };

          for (let jx = 0, jxLen = 3; jx < jxLen; jx++) {
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
