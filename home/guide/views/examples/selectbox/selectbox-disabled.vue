<template>
  <div class="selectbox-disabled">
    <selectbox
      :name="boxInfo.name"
      :selectbox-style="boxInfo.selectboxStyle"
      :items="boxInfo.items"
      :disabled="boxInfo.disabled"
    />
    <br><br><br><br><br><br><br><br><br><br><br><br>
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
        let boxInfo = {};
        const itemList = [];

        for (let ix = 0, ixLen = 10; ix < ixLen; ix++) {
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
          items: itemList,
          disabled: true,
        };

        return boxInfo;
      },
    },
  };
</script>
<style scoped>
  .selectbox-disabled{
    display: inline-block;
    margin-left: 5px;
  }
</style>
