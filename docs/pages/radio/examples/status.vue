<template>
  <div>
    <div class="box-demo">
      <h5># status list</h5>
      <radio
        v-model="checkedList[0]"
        :label="'Normal'"
      />
      <radio
        v-model="checkedList[1]"
        :label="'Selected'"
      />
      <radio
        v-model="checkedList[2]"
        :label="'Disable - On'"
        :disabled="isDisabled"
      />
      <radio
        v-model="checkedList[3]"
        :label="'Disable - Off'"
        :disabled="!isDisabled"
      />
    </div>
    <div class="box-demo">
      <h5># change event</h5>
      <radio
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
      <radio
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
  import radio from '@/components/radio/radio';
  import Button from '@/components/button/button';

  export default {
    components: {
      radio,
      Button,
    },
    data() {
      return {
        itemButtonName1: 'Change Disabled',
        itemButtonName2: 'Change Selected',
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
  h5 {
    padding-top: 3px;
    padding-bottom: 3px;
  }
</style>
