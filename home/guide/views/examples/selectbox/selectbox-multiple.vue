<template>
  <div class="selectbox-multiple">
    <selectbox
      :name="boxInfo.name"
      :selectbox-style="boxInfo.selectboxStyle"
      :multiple="boxInfo.multiple"
      :items="boxInfo.items"
      @keyup="onKeyUp"
      @select="onSelect"
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
      onSelect(item, target, index) {
        this.selectedData = item;
        this.target = target;
        this.index = index;
      },
      onKeyUp(e) {
        this.e = e;
      },
      _getBoxInfo() {
        let boxInfo = {};
        const itemList = [];

        for (let ix = 0, ixLen = 100; ix < ixLen; ix++) {
          itemList.push({
            name: `item${ix}`,
            value: ix,
          });
        }

        boxInfo = {
          name: 'nomalCbBox',
          selectboxStyle: {
            width: '180px',
            height: '30px',
          },
          multiple: true,
          items: itemList,
        };

        return boxInfo;
      },
    },
  };
</script>
<style scoped>
  .selectbox-multiple{
    display: inline-block;
    margin-left: 5px;
  }
</style>
