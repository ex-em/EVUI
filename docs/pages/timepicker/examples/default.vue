<template>
  <div>
    <ev-timepicker
      v-model="timeValue"
    />
    <br><br>
    timepicker value => {{ timeValue }}
    <br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>

<script>
  export default {
    components: {
    },
    data() {
      return {
        timeValue: '',
      };
    },
    methods: {
    },
  };
</script>
