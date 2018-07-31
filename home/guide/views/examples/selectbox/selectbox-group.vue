<template>
  <div class="selectbox-group">
    <selectbox
      :name="boxInfo.name"
      :selectbox-style="boxInfo.selectboxStyle"
      :is-group="boxInfo.isGroup"
      :multiple="boxInfo.multiple"
      :init-select-idx="3"
      :items="boxInfo.items"
    />
    <br><br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import selectbox from '@/components/selectbox/selectbox';

  export default {
    components: {
      selectbox,
    },
    data() {
      return {
        boxInfo: this._getBoxInfo(),
      };
    },
    methods: {
      _getBoxInfo() {
        let groupObj;
        let boxInfo = {};
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

        boxInfo = {
          name: 'groupCbBox',
          selectboxStyle: {
            width: '180px',
            height: '30px',
          },
          isGroup: true,
          multiple: true,
          items: itemList,
        };

        return boxInfo;
      },
    },
  };
</script>
<style scoped>
  .selectbox-group{
    display: inline-block;
    margin-left: 5px;
  }
</style>
