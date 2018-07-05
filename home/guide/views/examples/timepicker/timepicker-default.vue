<template>
  <div>
    <timepicker
      :spinner-arr="obj"
    />
    <br><br><br><br><br><br><br><br><br><br><br><br><br>
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
