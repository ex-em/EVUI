<template>
  <div>
    <h5># Default Model</h5>
    <br>
    <RadioGroup
      v-model="bindingValue"
      @on-change="changeEvent"
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
    <h5># Default Model small size</h5>
    <br>
    <RadioGroup
      v-model="bindingValue2"
      :size="`small`"
      @on-change="changeEvent"
    >
      <Radio
        :value="radioObj2[0].value"
      >
        {{ radioObj2[0].text }}
      </Radio>
      <Radio
        :value="radioObj2[1].value"
        :disabled="true"
        class="radioStyle"
      >
        {{ radioObj2[1].text }}
      </Radio>
      <Radio
        :value="radioObj2[2].value"
        class="radioStyle"
      >
        {{ radioObj2[2].text }}
      </Radio>
    </RadioGroup>
    <br>
    <br>
    bind value : {{ bindingValue2 }}
    <br>
    <br>
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
        bindingValue2: 'cellPhone',
        radioObj2: [
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
      changeEvent(e) {
        // return Event
        console.log(`changeEvent e : ${e}`);
      },
    },
  };
</script>

<style scoped>
  .radioStyle {
    margin: 0 0 0 10px;
  }
</style>
