<template>
  <div
    class="checkbox-group-all-check"
  >
    <h5># normal</h5>
    <br>
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
    <h5># include disabled</h5>
    <br>
    <Checkbox
      :value="`allCheckBoxValue1`"
      v-model="allCheckClick1"
      class="checkboxStyle"
      @change-event="allCheckEvent1"
    >
      ALL CHECK
    </Checkbox>
    <br>
    <br>
    <br>
    <Checkbox-group
      v-model="bindList1"
      @change-event="changeEvent"
    >
      <Checkbox
        :value="obj1[0].value"
        :disabled="obj1[0].disabled"
        class="checkboxStyle"
      >
        {{ obj1[0].text }}
      </Checkbox>
      <Checkbox
        :value="obj1[1].value"
        :disabled="obj1[1].disabled"
        class="checkboxStyle"
      >
        {{ obj1[1].text }}
      </Checkbox>
      <Checkbox
        :value="obj1[2].value"
        :disabled="obj1[2].disabled"
        class="checkboxStyle"
      >
        {{ obj1[2].text }}
      </Checkbox>
      <Checkbox
        :value="obj1[3].value"
        :disabled="obj1[3].disabled"
        class="checkboxStyle"
      >
        {{ obj1[3].text }}
      </Checkbox>
    </Checkbox-group>
    <br>
    <br>
    <br>
    <p>bindList : {{ bindList1 }}</p>
    <br>
    <p>allCheckClick : {{ allCheckClick1 }}</p>
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
        allCheckClick1: false,
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
        obj1: [
          {
            value: 'Base01',
            text: 'A',
            disabled: false,
          },
          {
            value: 'Base02',
            text: 'B',
            disabled: false,
          },
          {
            value: 'Base03',
            text: 'C',
            disabled: true,
          },
          {
            value: 'Base04',
            text: 'D',
            disabled: false,
          },
        ],
        bindList1: ['Base01', 'Base02'],
      };
    },
    computed: {
      allList1() {
        return this.obj1.filter(o => !o.disabled).map(o => o.value);
      },
    },
    watch: {
      bindList(list) {
        if (!(allList instanceof Array) || !(list instanceof Array)) {
          console.log('All List or Bind List are not correct format (:Array)!');
        } else {
          const a = allList.map(x => x).sort();
          const l = list.map(x => x).sort();
          if (_.isEqual(a, l)) {
            this.allCheckClick = true;
          } else {
            this.allCheckClick = false;
          }
        }
      },
      bindList1(list) {
        if (!(this.allList1 instanceof Array) || !(list instanceof Array)) {
          console.log('All List or Bind List are not correct format (:Array)!');
        } else {
          const a = this.allList1.map(x => x).sort();
          const l = list.map(x => x).sort();
          if (_.isEqual(a, l)) {
            this.allCheckClick1 = true;
          } else {
            this.allCheckClick1 = false;
          }
        }
      },
    },
    methods: {
      changeEvent(e) {
        console.log(`e : ${e}`);
      },
      allCheckEvent(e) {
        if (e.target.checked) {
          this.bindList.splice(0, allList.length, ...allList);
        } else {
          this.bindList.splice(0);
        }
      },
      allCheckEvent1(e) {
        if (e.target.checked) {
          this.bindList1.splice(0, this.allList1.length, ...this.allList1);
        } else {
          this.bindList1.splice(0);
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
