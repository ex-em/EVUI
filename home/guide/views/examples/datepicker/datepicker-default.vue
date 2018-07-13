<template>
  <div>
    <datepicker
      v-model="toggleFlag"
    />
    {{ toggleFlag }}
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import datepicker from '@/components/datepicker';

  export default {
    components: {
      datepicker,
    },
    data() {
      return {
        toggleFlag: true,
      };
    },
    methods: {
    },
  };
</script>

<style>
</style>
