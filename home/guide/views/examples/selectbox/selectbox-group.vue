<template>
  <div class="selectbox-group">
    <ev-selectbox
      :name="'groupCbBox'"
      :style="{ width: '180px', height: '30px' }"
      :is-group="true"
      :init-select-idx="3"
      :items="getGroupItemList()"
    />
    <ev-selectbox
      :name="'groupMultipleCbBox'"
      :style="{ width: '180px', height: '30px' }"
      :is-group="true"
      :multiple="true"
      :init-select-idx="3"
      :items="getGroupItemList()"
    />
    <br><br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>
<script>
  export default {
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
  .selectbox-group{
    display: inline-block;
    margin-left: 5px;
  }
</style>
