<template>
  <div>
    <ev-timepicker
      v-model="timeValue"
      :spinner-arr="obj"
      :show-footer="false"
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
        obj: [
          { from: 0, to: 11, initNumber: '11' },
          { from: 0, to: 59, initNumber: 53 },
          { from: 0, to: 59, initNumber: 7 },
        ],
      };
    },
    methods: {
    },
  };
</script>
