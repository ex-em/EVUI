<template>
  <div
    class="checkbox-group-all-check"
  >
    <Checkbox
      :value="`allCheckBoxValue`"
      v-model="allCheckClick"
      class="checkboxStyle"
      @change-event="allCheckEvent"
    >
      ALL CHECK
    </Checkbox>
    <br>
    <br>
    <br>
    <Checkbox-group
      v-model="bindList"
      @change-event="changeEvent"
    >
      <Checkbox
        :value="obj0[0].value"
        class="checkboxStyle"
      >
        {{ obj0[0].text }}
      </Checkbox>
      <Checkbox
        :value="obj0[1].value"
        class="checkboxStyle"
      >
        {{ obj0[1].text }}
      </Checkbox>
      <Checkbox
        :value="obj0[2].value"
        :disabled="false"
        class="checkboxStyle"
      >
        {{ obj0[2].text }}
      </Checkbox>
      <Checkbox
        :value="obj0[3].value"
        class="checkboxStyle"
      >
        {{ obj0[3].text }}
      </Checkbox>
    </Checkbox-group>
    <br>
    <br>
    <br>
    <p>bindList : {{ bindList }}</p>
    <br>
    <p>allCheckClick : {{ allCheckClick }}</p>
    <br>
    <br>
    <br>
  </div>
</template>

<script>
  import Checkbox from '@/components/checkbox/checkbox';
  import CheckboxGroup from '@/components/checkbox/checkbox-group';
  import _ from 'lodash';

  const allList = ['Base01', 'Base02', 'Base03', 'Base04'];
  export default {
    components: {
      Checkbox,
      CheckboxGroup,
    },
    data() {
      return {
        allCheckClick: false,
        obj0: [
          {
            value: 'Base01',
            text: 'A',
          },
          {
            value: 'Base02',
            text: 'B',
          },
          {
            value: 'Base03',
            text: 'C',
          },
          {
            value: 'Base04',
            text: 'D',
          },
        ],
        bindList: ['Base01', 'Base02'],
      };
    },
    computed: {
    },
    watch: {
      bindList(list) {
        if (_.isEqual(allList, list)) {
          this.allCheckClick = true;
        } else {
          this.allCheckClick = false;
        }
      },
    },
    methods: {
      changeEvent(e) {
        console.log(`e : ${e}`);
      },
      allCheckEvent(e) {
        console.log(`allCheckEvent e : ${e}`);
        if (e.target.checked) {
          this.bindList.splice(0, allList.length, ...allList);
        } else {
          this.bindList.splice(0);
        }
      },
    },
  };
</script>

<style scoped>
  .checkbox-group-all-check {
    display: block;
  }
  .checkboxStyle {
    margin: 0 10px 0 10px;
  }
</style>
