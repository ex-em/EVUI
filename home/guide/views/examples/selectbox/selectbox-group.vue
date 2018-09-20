<template>
  <div class="selectbox-group">
    <ev-selectbox
      :name="'groupCbBox'"
      :style="{ width: '180px',height: '30px' }"
      :is-group="true"
      :init-select-idx="3"
      :items="getGroupItemList()"
    />
    <ev-selectbox
      :name="'groupMultipleCbBox'"
      :style="{ width: '180px',height: '30px' }"
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
        let groupObj;
        const itemList = [];

        for (let ix = 0, ixLen = 20; ix < ixLen; ix++) {
          groupObj = {
            groupName: `group${ix}`,
            items: [],
          };

          for (let jx = 0, jxLen = 3; jx < jxLen; jx++) {
            groupObj.items.push({
              name: `group_${ix} > item${jx}`,
              value: ix,
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
