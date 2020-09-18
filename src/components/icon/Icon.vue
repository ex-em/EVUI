<template>
  <i
    :class="[icon, sizeCls]"
    @click.stop="onClick"
    @dblClick="onDblClick"
    @contextmenu="onContextMenu"
  />
</template>

<script>
import { computed, nextTick } from 'vue';
import '@/style/lib/icon.css';

export default {
  name: 'EvIcon',
  props: {
    icon: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
  },
  emits: {
    click: null,
    'dbl-click': null,
    'context-menu': null,
  },
  setup(props, { emit }) {
    const sizeCls = computed(() => `ev-icon-${props.size}`);
    const onClick = async (e) => {
      await nextTick();
      emit('click', e);
    };
    const onDblClick = async (e) => {
      await nextTick();
      emit('dbl-click', e);
    };
    const onContextMenu = async (e) => {
      await nextTick();
      emit('context-menu', e);
    };
    return {
      sizeCls,
      onClick,
      onDblClick,
      onContextMenu,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

</style>
