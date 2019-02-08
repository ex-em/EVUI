<template>
  <div>
    <h5># normal</h5>
    <br>
    <Checkbox-group
      v-model="bindList0"
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
        :disabled="true"
        class="checkboxStyle"
      >
        {{ obj0[3].text }}
      </Checkbox>
    </Checkbox-group>
    <br>
    <br>
    <p>Selected List : {{ bindList0 }}</p>
    <br>
    <br>
    <h5># small & square</h5>
    <br>
    <Checkbox-group
      v-model="bindList1"
      :type="`square`"
      :size="`small`"
      @change-event="changeEvent1"
    >
      <Checkbox
        :value="obj1[0].value"
        class="checkboxStyle"
      >
        {{ obj1[0].text }}
      </Checkbox>
      <Checkbox
        :value="obj1[1].value"
        class="checkboxStyle"
      >
        {{ obj1[1].text }}
      </Checkbox>
      <Checkbox
        :value="obj1[2].value"
        :disabled="false"
        class="checkboxStyle"
      >
        {{ obj1[2].text }}
      </Checkbox>
      <Checkbox
        :value="obj1[3].value"
        :disabled="true"
        class="checkboxStyle"
      >
        {{ obj1[3].text }}
      </Checkbox>
    </Checkbox-group>
    <br>
    <br>
    <p>Selected List1 : {{ bindList1 }}</p>
    <br>
    <br>
    <br>
  </div>
</template>

<script>
  import Checkbox from '@/components/checkbox/checkbox';
  import CheckboxGroup from '@/components/checkbox/checkbox-group';

  export default {
    components: {
      Checkbox,
      CheckboxGroup,
    },
    data() {
      return {
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
        bindList0: ['Base01', 'Base02'],
        obj1: [
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
        bindList1: ['Base03', 'Base04'],
      };
    },
    methods: {
      changeEvent(e) {
        console.log(`e : ${e}`);
      },
      changeEvent1(e) {
        console.log(`e1 : ${e}`);
      },
    },
  };
</script>

<style scoped>
  .checkboxStyle {
    margin: 0 10px 0 10px;
  }
</style>
