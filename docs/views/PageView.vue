<template>
  <h2 class="content-title">
    {{ $route.name }}
  </h2>
  <template v-if="$route.name !== 'Icon'">
    <example
      v-for="(value, name, index) in components"
      :key="`${name}_${index}`"
      v-bind="value"
      :title="name"
    />
  </template>
  <icon-list v-else />
  <markdown-view
    :source="mdText"
  />
</template>

<script>
import Example from 'docs/components/Example';
import MarkdownView from 'docs/components/MarkdownView';
import IconList from 'docs/views/icon/example/IconList';

export default {
  components: {
    Example,
    MarkdownView,
    IconList,
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
