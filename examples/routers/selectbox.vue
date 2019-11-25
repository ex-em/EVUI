<template>
  <div>
    <div style="display: inline-block; margin-left: 5px;">
      <div>Nomal ComboBox</div>
      <Selectbox
        :name="nomalCbBoxInfo.name"
        :style="nomalCbBoxInfo.selectboxStyle"
        :items="nomalCbBoxInfo.items"
        @keyup="onKeyUp"
        @select="onSelect"
      />
    </div>
    <div style="display: inline-block; margin-left: 20px;">
      <div>Multiple ComboBox</div>
      <Selectbox
        :name="multipleCbBoxInfo.name"
        :style="multipleCbBoxInfo.selectboxStyle"
        :multiple="multipleCbBoxInfo.multiple"
        :items="multipleCbBoxInfo.items"
        @keyup="onKeyUp"
        @select="onSelect"
      />
    </div>
    <div style="display: inline-block; margin-left: 20px;">
      <div>Group ComboBox</div>
      <Selectbox
        :name="groupCbBoxInfo.name"
        :style="groupCbBoxInfo.selectboxStyle"
        :is-group="groupCbBoxInfo.isGroup"
        :multiple="groupCbBoxInfo.multiple"
        :items="groupCbBoxInfo.items"
        @keyup="onKeyUp"
        @select="onSelect"
      />
    </div>
  </div>
</template>

<script>
  // import '@/styles/evui.css';
  import Selectbox from '@/components/selectbox/selectbox';

  export default {
    components: {
      Selectbox,
    },
    data() {
      return {
        time: null,
        nomalCbBoxInfo: this._getNomalCbBoxInfo(),
        multipleCbBoxInfo: this._getMultipleCbBoxInfo(),
        groupCbBoxInfo: this._getGroupCbBoxInfo(),
      };
    },
    created() {
      this.start = performance.now();
    },
    mounted() {
      this.end = performance.now();
      this.time = this.end - this.start;
    },
    methods: {
      onSelect(item, target, index) {
        this.selectedData = item;
        this.target = target;
        this.index = index;
      },
      onKeyUp(e) {
        this.e = e;
      },
      _getNomalCbBoxInfo() {
        let nomalCbBoxInfo = {};
        const itemList = [];

        for (let ix = 0, ixLen = 100; ix < ixLen; ix++) {
          itemList.push({
            name: `item${ix}`,
            value: ix,
          });
        }

        nomalCbBoxInfo = {
          name: 'nomalCbBox',
          selectboxStyle: {
            width: '180px',
            height: '30px',
          },
          items: itemList,
        };

        return nomalCbBoxInfo;
      },
      _getMultipleCbBoxInfo() {
        let multipleCbBoxInfo = {};
        const itemList = [];

        for (let ix = 0, ixLen = 100; ix < ixLen; ix++) {
          itemList.push({
            name: `item${ix}`,
            value: ix,
          });
        }

        multipleCbBoxInfo = {
          name: 'multipleCbBox',
          selectboxStyle: {
            width: '180px',
            height: '30px',
          },
          multiple: true,
          items: itemList,
        };

        return multipleCbBoxInfo;
      },
      _getGroupCbBoxInfo() {
        let ix;
        let ixLen;
        let jx;
        let jxLen;
        let groupObj;
        let groupCbBoxInfo = {};
        const itemList = [];

        for (ix = 0, ixLen = 20; ix < ixLen; ix++) {
          groupObj = {
            groupName: `group${ix}`,
            items: [],
          };

          for (jx = 0, jxLen = 3; jx < jxLen; jx++) {
            groupObj.items.push({
              name: `group_${ix} > item${jx}`,
              value: ix,
            });
          }

          itemList.push(groupObj);
        }

        groupCbBoxInfo = {
          name: 'groupCbBox',
          selectboxStyle: {
            width: '180px',
            height: '30px',
          },
          isGroup: true,
          multiple: true,
          items: itemList,
        };

        return groupCbBoxInfo;
      },
    },
  };
</script>

<style lang="scss">
  @import '~evui/styles/default';
</style>
