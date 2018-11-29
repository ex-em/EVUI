<template>
  <div>
    <div class="group-slot-demo">
      <Checkbox-group
        v-model="bindList"
        @change-event="onChangeEvent"
      >
        <Checkbox
          :id="obj0[0].id"
          :value="obj0[0].value"
        >
          {{ obj0[0].text }}
        </Checkbox>
        <Checkbox
          :id="obj0[1].id"
          :value="obj0[1].value"
        >
          {{ obj0[1].text }}
        </Checkbox>
        <Checkbox
          :id="obj0[2].id"
          :value="obj0[2].value"
        >
          {{ obj0[2].text }}
        </Checkbox>
      </Checkbox-group>
      <p>Selected List : {{ bindList }}</p>
    </div>
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
            id: 'RADIOID01',
            value: 'Base01',
            text: 'A',
          },
          {
            id: 'RADIOID02',
            value: 'Base02',
            text: 'B',
          },
          {
            id: 'RADIOID03',
            value: 'Base03',
            text: 'C',
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
</style>
