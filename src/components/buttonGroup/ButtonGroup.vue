<template>
  <div class="ev-button-group">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EvButtonGroup',
});
</script>
