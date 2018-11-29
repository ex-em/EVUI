<template>
  <div>
    <div class="group-slot-demo">
      <Checkbox-group
        v-model="bindList"
        @change-event="onChangeEvent"
      >
        <Checkbox
          :value="obj0[0].value"
        >
          {{ obj0[0].text }}
        </Checkbox>
        <Checkbox
          :value="obj0[1].value"
        >
          {{ obj0[1].text }}
        </Checkbox>
        <Checkbox
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
