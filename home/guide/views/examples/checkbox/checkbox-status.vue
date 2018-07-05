<template>
  <div>
    <div class="disable-demo">
      <checkbox
        v-model="checkedList[0]"
        :label="'Disable - On'"
        :disabled="isDisabled"
      />
      <checkbox
        v-model="checkedList[1]"
        :label="'Disable - Off'"
        :disabled="!isDisabled"
      />
      <checkbox
        v-model="checkedList[2]"
        :label="'Disable'"
        :disabled="changeDisabled"
      />
      <button @click="changeDisabledItem">
        {{ itemButtonName1 }}
      </button>
      <checkbox
        v-model="checkedList[3]"
        :label="'Value'"
      />
      <button @click="changeStatus">
        {{ itemButtonName2 }}
      </button>
      <div>checkedList : {{ checkedList }}</div>
    </div>
  </div>
</template>
<script>
  import checkbox from '@/components/checkbox/checkbox';

  export default {
    components: {
      checkbox,
    },
    data() {
      return {
        itemButtonName1: 'Change Disabled',
        itemButtonName2: 'Change Checked',
        changeDisabled: true,
        isDisabled: true,
        checkedList: [
          false, false, false, false,
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
 .disable-demo{
   display: inline-block;
   margin: 3px;
 }
</style>
