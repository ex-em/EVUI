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
        :label="'Disable Statue Change'"
        :disabled="changeDisabled"
      />
      <button @click="clickEvent"> {{ itemButtonName }} </button>
    </div>
    <div class="custom-event-demo">
      <checkbox
        v-model="checked"
        :label="label"
        @on-change="changeFn"
      />
      <p>alphabet value : {{ value }}</p>
    </div>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';

  export default {
    components: {
      checkbox,
    },
    data() {
      return {
        checked: false,
        code: 97,
        label: ' fire custom event',
        value: '',
        name: 'add alphabet when you change',
        itemButtonName: ' Change Status ',
        isDisabled: true,
        changeDisabled: true,
        checkedList: [
          false, false,
        ],
      };
    },
    methods: {
      changeFn: function changeFns(checked) {
        let value = this.value;
        let code = this.code;

        if (code === 123) {
          value = '';
          code = 97;
        } else if (checked === true) {
          value += String.fromCharCode(code);
          code++;
        }

        this.value = value;
        this.code = code;
      },
      clickEvent: function clickEvent() {
        this.changeDisabled = !this.changeDisabled;
      },
    },
  };
</script>
<style scoped>
  p {
    padding: 3px;
  }
 .disable-demo{
   display: inline-block;
 }
</style>
