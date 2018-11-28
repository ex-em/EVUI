<template>
  <div>
    <div class="bind-model">
      <h5># Default Model</h5>
      <RadioGroup
        v-model="radioObj0"
        @change-event="onChangeEvent"
      >
        <Radio
          :id="obj0[0].id"
          :value="obj0[0].value"
        >
          {{ obj0[0].text }}
        </Radio>
        <Radio
          :id="obj0[1].id"
          :value="obj0[1].value"
        >
          {{ obj0[1].text }}
        </Radio>
        <Radio
          :id="obj0[2].id"
          :value="obj0[2].value"
        >
          {{ obj0[2].text }}
        </Radio>
      </RadioGroup>
      <br>
      bind value : {{ radioObj0 }}
    </div>
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
        radioObj0: 'cellPhone',
        obj0: [
          {
            id: 'RADIOID01',
            text: 'Iphone',
            value: 'cellPhone',
          },
          {
            id: 'RADIOID02',
            text: 'Hermes',
            value: 'imitation',
          },
          {
            id: 'RADIOID03',
            text: 'Apple Watch',
            value: 'luxury',
          },
        ],
        radioObj1: 'cellPhone',
        obj1: [
          {
            id: 'RADIOID04',
            text: 'Iphone',
            value: 'cellPhone',
          },
          {
            id: 'RADIOID05',
            text: 'Hermes',
            value: 'imitation',
          },
          {
            id: 'RADIOID06',
            text: 'Apple Watch',
            value: 'luxury',
          },
        ],
      };
    },
    methods: {
      onChangeEvent(e) {
        // return Event
        console.log(`onChangeEvent e : ${e}`);
      },
      onChangeEvent2(e) {
        // return Event
        console.log(`onChangeEvent2 e : ${e}`);
      },
    },
  };
</script>

<style scoped>
</style>
