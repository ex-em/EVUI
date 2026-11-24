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

const acceptsMouseEvent = (_event: MouseEvent) => true;

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
    click: acceptsMouseEvent,
    'dbl-click': acceptsMouseEvent,
    'context-menu': acceptsMouseEvent,
    // Vue also dispatches these events to camel-cased render listeners.
    dblClick: acceptsMouseEvent,
    contextMenu: acceptsMouseEvent,
  },
  setup(_, { emit }) {
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

<style src="../../style/lib/icon.css"></style>
