<template>
  <i
    :class="[
      icon,
      { [`ev-icon-${size}`]: !!size },
    ]"
    @click="onClick"
    @dblClick="onDblClick"
    @contextmenu="onContextMenu"
  />
</template>

<script>
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
      validator: val => ['', 'small', 'medium', 'large'].includes(val),
    },
  },
  emits: {
    click: null,
    'dbl-click': null,
    'context-menu': null,
  },
  setup(props, { emit }) {
    const onClick = (e) => {
      emit('click', e);
    };
    const onDblClick = (e) => {
      emit('dbl-click', e);
    };
    const onContextMenu = (e) => {
      emit('context-menu', e);
    };
    return {
      onClick,
      onDblClick,
      onContextMenu,
    };
  },
};
</script>
