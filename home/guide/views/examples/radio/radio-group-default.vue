<template>
  <div>
    <h5># Default Model</h5>
    <br>
    <RadioGroup
      v-model="bindingValue"
      @change-event="onChangeEvent"
    >
      <Radio
        :value="radioObj[0].value"
      >
        {{ radioObj[0].text }}
      </Radio>
      <Radio
        :value="radioObj[1].value"
        class="radioStyle"
      >
        {{ radioObj[1].text }}
      </Radio>
      <Radio
        :value="radioObj[2].value"
        :disabled="true"
        class="radioStyle"
      >
        {{ radioObj[2].text }}
      </Radio>
    </RadioGroup>
    <br>
    <br>
    bind value : {{ bindingValue }}
    <br>
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
        bindingValue: 'cellPhone',
        radioObj: [
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
  .radioStyle {
    margin: 0 0 0 10px;
  }
</style>
