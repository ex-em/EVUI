<template>
  <div>
    <toggle
      v-model="toggleFlag"
    />
    {{ toggleFlag }}
    <toggle
      v-model="toggleFlag2"
    />
    {{ toggleFlag2 }}
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
        toggleFlag: true,
        toggleFlag2: false,
        largeText: {
          onText: 'ON',
          offText: 'OFF',
          fontSize: 11,
        },
      };
    },
    methods: {
    },
  };
</script>

<style>
</style>
