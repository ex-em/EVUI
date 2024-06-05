<template>
  <i
    :class="[icon, { [`ev-icon-${size}`]: !!size }]"
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

<style>
[class^='ev-icon-'],
[class*=' ev-icon-'] {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'EVUI' !important;
  speak: none;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;

  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.ev-icon-small {
  font-size: 16px;
}

.ev-icon-medium {
  font-size: 20px;
}

.ev-icon-large {
  font-size: 25px;
}
</style>
