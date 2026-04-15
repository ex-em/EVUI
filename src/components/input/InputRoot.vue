<script setup>
import { provideInputContext } from './context';

defineOptions({ name: 'EvInputRoot' });

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
});

provideInputContext(props);
</script>

<template>
  <div role="group">
    <slot />
  </div>
</template>
