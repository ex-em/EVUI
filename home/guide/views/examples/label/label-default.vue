<template>
  <div>
    <div class="label-demo">
      <h5> # Normal </h5>
      <Label
        :value="textList[0]"
      />
      <Label
        :mandatory="true"
        :value="textList[1]"
      />
      <Label
        :checkValid="true"
        :isError="true"
        :value="textList[2]"
      />
      <Label
        :mandatory="true"
        :checkValid="true"
        :isError="true"
        :value="textList[3]"
      />
      <Label
        :checkValid="true"
        :isSuccess="true"
        :value="textList[4]"
      />
      <Label
        :checkValid="true"
        :isFailed="true"
        :value="textList[5]"
      />
      <div>
        <Label
          :checkValid="true"
          :isSuccess="checkItem"
          :isFailed="!checkItem"
          :value="textList[6]"
        />
        <button @click="checkList"> click me!</button>
      </div>
    </div>
  </div>
</template>
<script>
  import Label from '@/components/label/label';

  export default {
    components: {
      Label,
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
  .label-demo {
    width: 35%;
  }
</style>
