<template>
  <h2 class="content-title">
    {{ $route.name }}
  </h2>
  <example
    v-for="(value, name, index) in components"
    :key="`${currentMenu}_${name}_${index}`"
    v-bind="value"
    :title="name"
  />
  <icon-list v-if="$route.name === 'Icon'"/>
  <markdown-view
    :source="mdText"
  />
</template>

<script>
import { computed } from 'vue';
import router from 'docs/router';
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
    const currentMenu = computed(() => router.currentRoute?.value.name);
    return {
      currentMenu,
    };
  },
};
</script>
