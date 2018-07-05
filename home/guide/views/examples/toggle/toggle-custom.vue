<template>
  <div>
    <toggle
      :toggle-obj="largeObj"
      :toggle-text="largeText"
    />
    <br>
    <br>
    <toggle
      :toggle-on="true"
    />
    <br>
    <br>
    <toggle
      :toggle-obj="smallObj"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import toggle from '@/components/toggle';

  export default {
    components: {
      toggle,
    },
    data() {
      return {
        largeObj: {
          width: 80,
          height: 34,
        },
        largeText: {
          onText: 'ON',
          offText: 'OFF',
          fontSize: 17,
        },
        smallObj: {
          width: 30,
          height: 14,
        },
      };
    },
    methods: {
    },
  };
</script>
