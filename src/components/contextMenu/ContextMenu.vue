<template>
  <template v-if="isShow && items.length">
    <teleport to="#ev-context-menu-modal">
      <menu-list
        ref="rootMenuList"
        v-model:isShow="isShow"
        v-clickoutside="hide"
        :class="customClass"
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
      validator: (list) => {
        if (list.some(v => v.children !== undefined && !Array.isArray(v.children))) {
          console.warn('[EVUI][ContextMenu] children attribute must be \'Array\' type.');
          return false;
        } else if (list.some(v => v.click !== undefined && typeof v.click !== 'function')) {
          console.warn('[EVUI][ContextMenu] click attribute must be \'Function\' type.');
          return false;
        }
        return true;
      },
    },
    customClass: {
      type: String,
      default: '',
    },
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
