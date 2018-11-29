<template>
  <div>
    <div class="bind-model">
      <h5># Default Model</h5>
      <RadioGroup
        v-model="radioObj0"
        @change-event="onChangeEvent"
      >
        <Radio
          :value="obj0[0].value"
        >
          {{ obj0[0].text }}
        </Radio>
        <Radio
          :value="obj0[1].value"
        >
          {{ obj0[1].text }}
        </Radio>
        <Radio
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
            text: 'Iphone',
            value: 'cellPhone',
          },
          {
            text: 'Hermes',
            value: 'imitation',
          },
          {
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
    },
  };
</script>

<style scoped>
</style>
