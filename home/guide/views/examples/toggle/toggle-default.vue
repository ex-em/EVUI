<template>
  <div>
    <toggle
      v-model="toggleFlag"
    />
    {{ toggleFlag }}
    <br>
    <br>
    <toggle
      v-model="toggleFlag2"
    />
    {{ toggleFlag2 }}
    <br>
    <br>
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
