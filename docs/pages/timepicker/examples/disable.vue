<template>
  <div>
    <timepicker
      v-model="timeValue"
      :spinner-arr="obj"
      :disabled="true"
    />
  </div>
</template>

<script>
  import timepicker from '@/components/timepicker/timepicker';

  export default {
    components: {
      timepicker,
    },
    data() {
      return {
        timeValue: '',
        obj: [
          { from: 0, to: 23 },
          { from: 0, to: 59 },
          { from: 0, to: 59 },
        ],
      };
    },
    methods: {
    },
  };
</script>
