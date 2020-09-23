<template>
  <div
    ref="select"
    class="ev-select"
    :class="{
        'is-selected': isDropbox,
      }"
    @click.stop.prevent="clickDropbox"
  >
    <input
      v-model="mvName"
      v-clickoutside="clickOutsideDropbox"
      type="text"
      class="ev-input"
      :placeholder="placeholder"
      readonly
      @click.stop.prevent="clickSelectInput"
    />
    <i
      class="ev-input-suffix ev-icon-s-arrow-down"
      :class="{
        'is-selected': isDropbox,
      }"
    />
  </div>
  <teleport to="body">
    <div
      v-if="isDropbox"
      class="ev-select-dropdown"
      :style="dropdownStyle"
    >
      <ul>
        <li
          v-for="(item, idx) in items"
          :key="`${item.value}_${idx}`"
          class="ev-select-dropdown-item"
          :class="{
            'is-selected': item.value === mv,
          }"
          :title="item.name"
          @click.stop.prevent="clickItem(item.value)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </teleport>
</template>

<script>
import { selectClickoutside as clickoutside } from '@/directives/clickoutside';
import { useDropdown, useModel } from './uses';

export default {
  name: 'EvSelect',
  directives: {
    clickoutside,
  },
  props: {
    modelValue: {
      type: [Boolean, String, Number],
      default: null,
    },
    placeholder: {
      type: String,
      default: '',
    },
    items: {
      type: Array,
      default: () => [],
    },
    inputSize: {
      type: Object,
      default: () => ({
        width: 200,
        height: 35,
      }),
    },
  },
  emits: {
    'update:modelValue': null,
  },
  setup() {
    const {
      mv,
      mvName,
      clickItem,
    } = useModel();

    const {
      select,
      isDropbox,
      dropdownStyle,
      clickSelectInput,
      clickDropbox,
      clickOutsideDropbox,
    } = useDropdown();

    return {
      mv,
      mvName,
      clickItem,
      select,
      isDropbox,
      dropdownStyle,
      clickSelectInput,
      clickDropbox,
      clickOutsideDropbox,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-select {
  $select-height: 35px;
  display: block;
  position: relative;
  width: 100%;
  height: $select-height;
  border: 1px solid #B2B2B2;
  border-radius: 2px;
  cursor: pointer;

  &.is-selected {
    border: 1px solid #409EFF;
  }

  .ev-input {
    width: 100%;
    height: 100%;
    padding: 0 30px 0 15px;
    border: 0;
    outline: 0;
    background-color: transparent;
    cursor: pointer;
  }

  .ev-input-suffix {
    position: absolute;
    top: 0;
    right: 5px;
    line-height: $select-height;
    transform: rotate(0deg);
    transition-duration: 0.3s;

    &.is-selected {
      transform: rotate(180deg);
    }
  }
}
.ev-select-dropdown {
  $select-height: 35px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-height: $select-height * 5;
  border: 1px solid #B2B2B2;
  background-color: white;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 100;
  cursor: pointer;

  ul {
    background-color: #0D0D0D;
    list-style: none;
  }
  li {
    height: $select-height;
    line-height: $select-height;
  }
}
.ev-select-dropdown-item {
  $select-height: 35px;
  padding: 0 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  color: #0D0D0D;
  background-color: #FCFCFC;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
  &.is-selected {
    color: #EBEBEB;
    background-color: #730EF4;
  }
}
</style>
