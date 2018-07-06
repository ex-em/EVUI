<template>
  <div>
    <timepicker
      v-model="timeValue"
      :spinner-arr="obj"
    />
    <br><br>
    timepicker value => {{ timeValue }}
    <br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import timepicker from '@/components/timepicker/timepicker';

  export default {
    components: {
      timepicker,
    },
    data() {
      return {
        timeValue: '',
        obj: [
          { from: 0, to: 23, initNumber: '11' },
          { from: 0, to: 59, initNumber: 53 },
          { from: 0, to: 59, initNumber: 7 },
        ],
      };
    },
    methods: {
    },
  };
</script>
