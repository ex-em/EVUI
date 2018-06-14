<template>
  <div>
    <timePicker
      :spinner-arr="obj"
      style="width: 220px; height: 40px;"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import timePicker from '@/components/timePicker/timePicker';

  export default {
    name: 'TimePicker',
    components: {
      timePicker,
    },
    data() {
      return {
        obj: [
          { from: 0, to: 23, selectedNumber: '11' },
          { from: 0, to: 59, mid: true, selectedNumber: '05' },
          { from: 0, to: 59, selectedNumber: '23' },
        ],
      };
    },
    mounted() {
    },
    methods: {
    },
  };
</script>

<style scoped>
</style>
