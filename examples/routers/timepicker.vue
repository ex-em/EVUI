<template>
  <div>
    <timepicker
      :spinner-arr="obj"
    />
    <br><br><br>
    <timepicker
      :spinner-arr="obj2"
    />
    <br><br><br>
    <timepicker
      :spinner-arr="obj3"
    />
  </div>
</template>

<script>
  import timepicker from '@/components/timepicker/timepicker';

  export default {
    name: 'Timepicker',
    components: {
      timepicker,
    },
    data() {
      return {
        obj: [
          { from: 0, to: 23, initNumber: '11' },
          { from: 0, to: 59, initNumber: '05' },
          { from: 0, to: 59, initNumber: '23' },
        ],
        obj2: [
          { from: 0, to: 23 },
          { from: 0, to: 59 },
          { from: 0, to: 59 },
        ],
        obj3: [
          { from: 0, to: 23, initNumber: 5 },
          { from: 0, to: 59, initNumber: 53 },
          { from: 0, to: 59, initNumber: 7 },
        ],
      };
    },
    mounted() {
    },
    methods: {
    },
  };
</script>

<style lang="scss">
  @import '~evui/styles/default';
</style>
