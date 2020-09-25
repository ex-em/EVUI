<template>
  <h2 class="content-title">
    Checkbox
  </h2>
  <example
    v-for="(value, name, index) in components"
    :key="`${name}_${index}`"
    v-bind="value"
    :title="name"
  />
  <markdown-view
    :source="mdText"
  />
</template>

<script>
import Example from 'docs/components/Example';
import MarkdownView from 'docs/components/MarkdownView';

export default {
  components: {
    Example,
    MarkdownView,
  },
  inheritAttrs: false,
  props: {
    mdText: {
      type: String,
      default: '',
    },
    components: {
      type: Object,
      default: () => {},
    },
  },
  setup() {
  },
};
</script>
