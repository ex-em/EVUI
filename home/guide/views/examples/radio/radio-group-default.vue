<template>
  <div>
    <div class="bind-model">
      <h5># Default Model</h5>
      <RadioGroup
        v-model="radioObj0"
        @changeEvent="onChangeEvent"
      >
        <Radio
          :id="obj0[0].id"
          :label="obj0[0].label"
          :group-name="obj0[0].name"
        />
        <Radio
          :id="obj0[1].id"
          :label="obj0[1].label"
          :group-name="obj0[1].name"
        />
        <Radio
          :id="obj0[2].id"
          :label="obj0[2].label"
          :group-name="obj0[2].name"
        />
      </RadioGroup>
      bind value : {{ radioObj0 }}
    </div>
    <br>
    <div class="bind-model">
      <h5># Group Model</h5>
      <Radio
        v-for="list in obj1"
        :key="list.id"
        :id="list.id"
        :label="list.label"
        :group-name="list.name"
        v-model="radioObj1"
      />
      bind value : {{ radioObj1 }}
    </div>
    <br>
  </div>
</template>

<script>
  import RadioGroup from '@/components/radio/radio-group';
  import Radio from '@/components/radio/radio';

  export default {
    components: {
      RadioGroup,
      Radio,
    },
    data() {
      return {
        radioObj0: 'RADIOID01',
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
        radioObj1: 'RADIOID12',
        obj1: [
          {
            id: 'RADIOID11',
            label: 'RADIOID1-v',
            name: 'RADIOID1',
          },
          {
            id: 'RADIOID12',
            label: 'RADIOID2-v',
            name: 'RADIOID1',
          },
          {
            id: 'RADIOID13',
            label: 'RADIOID3-v',
            name: 'RADIOID1',
          },
        ],
      };
    },
    methods: {
      onChangeEvent(e) {
        // return Event
        console.log(`e : ${e}`);
      },
    },
  };
</script>

<style scoped>
</style>
