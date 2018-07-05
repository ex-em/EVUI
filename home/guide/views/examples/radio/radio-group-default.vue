<template>
  <div>
    <div class="bind-model">
      <h5># Bind Model</h5>
      <radio-group
        v-model="value"
      >
        <radio
          :label="radioList[0].name"
        />
        <radio
          :label="radioList[1].name"
        />
        <radio
          :label="radioList[2].name"
        />
      </radio-group>
    </div>
  </div>
</template>
<script>
  import radio from '@/components/radio/radio';
  import radioGroup from '@/components/radio/radio-group';

  export default {
    components: {
      radio,
      radioGroup,
    },
    data() {
      return {
        value: null,
        radioList: [
          {
            name: 'apple',
          },
          {
            name: 'orange',
          },
          {
            name: 'banana',
          },
        ],
      };
    },
  };
</script>
<style scoped>
  div{
    display: inline-block;
  }
  p{
    margin-left: 30px;
  }
</style>
