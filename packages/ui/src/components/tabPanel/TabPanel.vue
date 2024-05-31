<template>
  <article v-show="isSelected" class="ev-tab-panel">
    <slot />
  </article>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { evTabKey } from '../tabs/provide';

defineOptions({
  name: 'EvTabPanel',
});
interface Props {
  value: string | number;
  text: string | number;
  disabled: boolean;
}
const props = defineProps<Props>();

const evTabs = inject(evTabKey);
const isSelected = computed(() => props.value === evTabs?.value);
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-tab {
  ul,
  li {
    list-style: none;
  }

  &-header {
    position: relative;

    .ev-tab-list {
      display: flex;
    }
    .ev-tab-title {
      padding: 5px 17px;

      @include evThemify() {
        border: 1px solid evThemed('border-base');
        border-left: 0;
      }
      @include shortening(block, 90px);

      &:first-child {
        @include evThemify() {
          border-left: 1px solid evThemed('border-base');
        }
      }
    }
  }
}
</style>
