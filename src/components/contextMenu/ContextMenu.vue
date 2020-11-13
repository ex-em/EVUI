<template>
  <template v-if="isShow && items.length">
    <teleport to="#ev-context-menu">
      <menu-list
        ref="rootMenuList"
        v-model:isShow="isShow"
        v-clickoutside="hide"
        :items="items"
        :style="menuStyle"
        :comp="comp"
      />
    </teleport>
  </template>
</template>

<script>
import { onBeforeMount } from 'vue';
import { clickoutside } from '@/directives/clickoutside';
import MenuList from './MenuList';
import { useModel, usePosition } from './uses';

export default {
  name: 'EvContextMenu',
  directives: {
    clickoutside,
  },
  components: {
    MenuList,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  emits: {
  },
  setup() {
    const {
      comp,
      initWrapperDiv,
    } = useModel();

    const {
      isShow,
      rootMenuList,
      menuStyle,
      show,
      hide,
    } = usePosition();

    onBeforeMount(() => initWrapperDiv());

    return {
      isShow,
      rootMenuList,
      menuStyle,
      comp,
      show,
      hide,
    };
  },
};
</script>

<style lang="scss">
</style>
