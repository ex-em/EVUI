<template>
  <div>
    <div class="label-demo">
      <h5> # Normal </h5>
      <Label
        :value="textList[0]"
        :fit="true"
      />
      <Label
        :mandatory="true"
        :value="textList[1]"
        :fit="true"
      />
      <Label
        :checkValid="true"
        :isError="true"
        :value="textList[2]"
        :fit="true"
      />
      <Label
        :mandatory="true"
        :checkValid="true"
        :isError="true"
        :value="textList[3]"
        :fit="true"
      />
      <Label
        :checkValid="true"
        :isSuccess="true"
        :value="textList[4]"
        :fit="true"
      />
      <Label
        :checkValid="true"
        :isFailed="true"
        :value="textList[5]"
        :fit="true"
      />
    </div>
    <div class="event-demo">
      <h5> # Event </h5>
      <Label
        :checkValid="true"
        :isSuccess="checkItem"
        :isFailed="!checkItem"
        :value="textList[6]"
        :fit="true"
      />
      <Button
        :text="'Click Me!'"
        @click="checkList"
      />
    </div>
    <div class="compose-demo">
      <h5> # compose </h5>
      <Label
        :value="textList[7]"
        :fit="true"
      />
      <input-number
        :readonly="true"
        :value="0.5"
        width="100"
      />
    </div>
  </div>
</template>
<script>
  import Label from '@/components/label/label';
  import Button from '@/components/button';
  import inputNumber from '@/components/input/input.number';

  export default {
    components: {
      Label,
      Button,
      inputNumber,
    },
    data() {
      return {
        textList: [
          'Normal',
          'Important',
          'Error',
          'Important Error',
          'Success',
          'Failed',
          'Check Event',
          'Input',
        ],
        checkItem: false,
      };
    },
    methods: {
      checkList: function checkList() {
        this.checkItem = !this.checkItem;
      },
    },
  };
</script>
<style scoped>
  div{
    padding: 3px;
  }
  p{
    margin: 2px;
  }
</style>
