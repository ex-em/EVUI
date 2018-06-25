<template>
  <div>
    <timePicker
      :spinner-arr="obj"
    />
    <br><br><br>
    <timePicker
      :spinner-arr="obj2"
    />
    <br><br><br>
    <timePicker
      :spinner-arr="obj3"
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
