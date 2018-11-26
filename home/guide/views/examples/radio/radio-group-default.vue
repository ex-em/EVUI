<template>
  <div>
    <div class="bind-model">
      <h5># Default Model</h5>
      <RadioGroup
        v-model="radioObj0"
        @changeEvent="onChangeEvent"
        @changeTarget="onChangeTarget"
        @changeValue="onChangeValue"
      >
        <Radio
          :radio-id="obj0[0].id"
          :radio-value="obj0[0].value"
          :radio-name="obj0[0].name"
        />
        <Radio
          :radio-id="obj0[1].id"
          :radio-value="obj0[1].value"
          :radio-name="obj0[1].name"
        />
        <Radio
          :radio-id="obj0[2].id"
          :radio-value="obj0[2].value"
          :radio-name="obj0[2].name"
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
        :radio-id="list.id"
        :radio-value="list.value"
        :radio-name="list.name"
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
        radioObj0: 'Base03',
        obj0: [
          {
            id: 'RADIOID01',
            value: 'Base01',
            name: 'RADIOID0',
          },
          {
            id: 'RADIOID02',
            value: 'Base02',
            name: 'RADIOID0',
          },
          {
            id: 'RADIOID03',
            value: 'Base03',
            name: 'RADIOID0',
          },
        ],
        radioObj1: 'RADIOID2-v',
        obj1: [
          {
            id: 'RADIOID11',
            value: 'RADIOID1-v',
            name: 'RADIOID1',
          },
          {
            id: 'RADIOID12',
            value: 'RADIOID2-v',
            name: 'RADIOID1',
          },
          {
            id: 'RADIOID13',
            value: 'RADIOID3-v',
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
      onChangeTarget(t) {
        // return DOM
        console.log(`t : ${t}`);
      },
      onChangeValue(v) {
        // return value
        console.log(`v : ${v}`);
      },
    },
  };
</script>

<style scoped>
</style>
