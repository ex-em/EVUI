<template>
  <div>
    <toggle
    />
    <br>
    <br>
    <toggle
      :toggle-on="true"
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
      };
    },
    methods: {
    },
  };
</script>
