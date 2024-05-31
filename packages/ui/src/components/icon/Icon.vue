<template>
  <i
    :class="[
      {
        [`ev-icon-${props.icon}`]: iconList[props.icon],
        [`ev-icon-${props.size}`]: !!props.size,
      },
    ]"
    @click="onClick"
    @dblClick="onDblClick"
    @contextmenu="onContextMenu"
  />
</template>

<script setup lang="ts">
import { iconList } from './icon-list';
import type { IconName } from './icon-list';

defineOptions({
  name: 'EvIcon',
});

interface Props {
  icon: IconName;
  size?: 'small' | 'medium' | 'large';
}
const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
});

interface Emits {
  (e: 'click', evt: MouseEvent): void;
  (e: 'dbl-click', evt: MouseEvent): void;
  (e: 'context-menu', evt: MouseEvent): void;
}
const emit = defineEmits<Emits>();

const onClick = (e: MouseEvent) => {
  emit('click', e);
};
const onDblClick = (e: MouseEvent) => {
  emit('dbl-click', e);
};
const onContextMenu = (e: MouseEvent) => {
  emit('context-menu', e);
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
