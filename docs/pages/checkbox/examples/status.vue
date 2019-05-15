<template>
  <div>
    <div class="box-demo">
      <h5># status list</h5>
      <checkbox
        v-model="checkedList[0]"
        :label="'Normal'"
      />
      <checkbox
        v-model="checkedList[1]"
        :label="'Checked'"
      />
      <checkbox
        v-model="checkedList[2]"
        :label="'Disable - On'"
        :disabled="isDisabled"
      />
      <checkbox
        v-model="checkedList[3]"
        :label="'Disable - Off'"
        :disabled="!isDisabled"
      />
    </div>
    <div class="box-demo">
      <h5># change event</h5>
      <checkbox
        v-model="checkedList[4]"
        :label="'Disable'"
        :disabled="changeDisabled"
      />
      <Button
        :text="itemButtonName1"
        size="small"
        type="primary"
        @click="changeDisabledItem"
      />
      <checkbox
        v-model="checkedList[5]"
        :label="'Value'"
      />
      <Button
        :text="itemButtonName2"
        size="small"
        type="primary"
        @click="changeStatus"
      />
    </div>
  </div>
</template>
<script>
  import checkbox from '@/components/checkbox/checkbox';
  import Button from '@/components/button';

  export default {
    components: {
      checkbox,
      Button,
    },
    data() {
      return {
        itemButtonName1: 'Change Disabled',
        itemButtonName2: 'Change Checked',
        changeDisabled: true,
        isDisabled: true,
        checkedList: [
          false, true, false, false, false, false,
        ],
      };
    },
    methods: {
      changeDisabledItem: function changeDisabledItem() {
        this.changeDisabled = !this.changeDisabled;
      },
      changeStatus: function changeStatus() {
        this.checkedList.push(!this.checkedList.pop());
      },
    },
  };
</script>
<style scoped>
  .box-demo {
    padding-top: 2px;
    padding-left: 1px;
  }
  .value-view {
    padding-top: 5px;
    padding-left: 1px;
  }
  h5 {
    padding-top: 3px;
    padding-bottom: 3px;
  }
</style>
