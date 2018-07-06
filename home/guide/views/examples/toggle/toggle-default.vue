<template>
  <div>
    <toggle
      v-model="toggleFlag"
      :toggle-on="toggleFlag"
    />
    {{ toggleFlag }}
    <br>
    <br>
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
      };
    },
    methods: {
    },
  };
</script>
