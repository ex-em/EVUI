<template>
  <div>
    <toggle
      v-model="toggleValue1"
      :toggle-obj="largeObj"
      :toggle-text="largeText"
    />
    {{ toggleValue1 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue2"
    />
    {{ toggleValue2 }}
    <br>
    <br>
    <toggle
      v-model="toggleValue3"
      :toggle-obj="smallObj"
    />
    {{ toggleValue3 }}
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
        toggleValue1: true,
        toggleValue2: false,
        toggleValue3: true,
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
