<template>
  <span
    :class="{
      'is-current': page.isCurrent,
      'is-disabled': disabled || page.disabled,
      [page.class]: true
    }"
    v-bind="$attrs"
    :aria-current="page.isCurrent"
    @click.stop="page.click"
  >
    <slot>{{ page.number }}</slot>
  </span>
</template>

<script>

export default {
  name: 'PageButton',
  props: {
    page: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
