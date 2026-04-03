<template>
  <i
    :class="[icon, { [`ev-icon-${size}`]: !!size }]"
    :style="{ color }"
    @click="onClick"
    @dblClick="onDblClick"
    @contextmenu="onContextMenu"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
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
    color: {
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
    const onClick = (e: MouseEvent) => {
      emit('click', e);
    };
    const onDblClick = (e: MouseEvent) => {
      emit('dbl-click', e);
    };
    const onContextMenu = (e: MouseEvent) => {
      emit('context-menu', e);
    };
    return {
      onClick,
      onDblClick,
      onContextMenu,
    };
  },
});
</script>
