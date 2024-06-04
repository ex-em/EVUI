<template>
  <span
    :class="{
      'is-current': props.page.isCurrent,
      'is-disabled': props.disabled || props.page.disabled,
      [props.page.class]: true,
    }"
    v-bind="$attrs"
    :aria-current="props.page.isCurrent"
    @click.stop="props.page.click"
  >
    <slot>{{ props.page.number }}</slot>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: {
    number: number;
    isCurrent: boolean;
    disabled: boolean;
    class: string;
    click: (e: MouseEvent) => void;
  };
  disabled?: boolean;
}>();
</script>
