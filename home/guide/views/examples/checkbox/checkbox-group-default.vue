<template>
  <div>
    <div class="group-slot-demo">
      <Checkbox-group
        v-model="bindList"
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
      };
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
