<template>
  <div>
    <Checkbox-group
      v-model="bindList"
      @change-event="onChangeEvent"
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
    <p>Selected List : {{ bindList }}</p>
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
        bindList: ['Base01', 'Base02'],
      };
    },
    methods: {
      onChangeEvent(e) {
        console.log(`e : ${e}`);
      },
    },
  };
</script>

<style scoped>
  .checkboxStyle {
    margin: 0 10px 0 10px;
  }
</style>
