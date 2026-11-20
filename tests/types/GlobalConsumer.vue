<template>
  <ev-button html-type="reset" @click="reset">Reset</ev-button>
  <ev-tabs :panels="[{ text: 'General', value: 'general' }]">
    <ev-tab-panel value="general">General</ev-tab-panel>
  </ev-tabs>
  <ev-calendar mode="dateRange" />
  <!-- @vue-expect-error -->
  <ev-button html-type="link" />
  <!-- @vue-expect-error -->
  <ev-calendar mode="weekly" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    reset() {
      this.$message({ message: 'Reset', type: 'info' });
      this.$messagebox({ onClose: (action) => action === 'ok' });
      this.$notify({ position: 'top-left' });
      // @ts-expect-error notification positions follow the installed service options
      this.$notify({ position: 'center' });
    },
  },
});
</script>
