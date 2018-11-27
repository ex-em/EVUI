<template>
  <div>
    <div class="group-slot-demo">
      <Checkbox-group
        v-model="bindList"
        @changeEvent="onChangeEvent"
      >
        <Checkbox
          :id="obj0[0].id"
          :label="obj0[0].label"
          :group-name="obj0[0].name"
        />
        <Checkbox
          :id="obj0[1].id"
          :label="obj0[1].label"
          :group-name="obj0[1].name"
        />
        <Checkbox
          :id="obj0[2].id"
          :label="obj0[2].label"
          :group-name="obj0[2].name"
        />
      </Checkbox-group>
      <p>Selected List : {{ bindList }}</p>
    </div>
    <br>
    <br>
    <br>
    <div class="group-slot-demo">
      <Checkbox-group
        v-model="bindList1"
        @changeEvent="onChangeEvent"
      >
        <Checkbox
          :id="obj1[0].id"
          :label="obj1[0].label"
          :group-name="obj1[0].name"
        />
        <Checkbox
          :id="obj1[1].id"
          :label="obj1[1].label"
          :group-name="obj1[1].name"
        />
        <Checkbox
          :id="obj1[2].id"
          :label="obj1[2].label"
          :group-name="obj1[2].name"
        />
      </Checkbox-group>
      <p>Selected List : {{ bindList1 }}</p>
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
            label: 'Base01',
            name: 'RADIOID0',
          },
          {
            id: 'RADIOID02',
            label: 'Base02',
            name: 'RADIOID0',
          },
          {
            id: 'RADIOID03',
            label: 'Base03',
            name: 'RADIOID0',
          },
        ],
        bindList: ['RADIOID01', 'RADIOID02'],
        obj1: [
          {
            id: 'RADIOID11',
            label: 'Base11',
            name: 'RADIOID1',
          },
          {
            id: 'RADIOID12',
            label: 'Base12',
            name: 'RADIOID1',
          },
          {
            id: 'RADIOID13',
            label: 'Base13',
            name: 'RADIOID1',
          },
        ],
        bindList1: ['RADIOID13'],
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
  div{
    display: inline-block;
  }
  p{
    padding: 5px;
  }
</style>
