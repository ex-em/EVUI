<template>
  <div
    class="dropdown-area"
    :style="dropdownStyle"
  >
    <div
      v-if="multiple"
      class="multiple-input-area"
    >
      <input
        type="text"
        :disabled="disabled"
        class="input-text"
        @keyup="onKeyUp"
      >
    </div>
    <div class="listbox-area">
      <div
        v-if="isGroup"
        class="group-area"
      >
        <div
          v-for="item in items"
          :key="item.groupName"
          class="group-row"
        >
          <li class="title">
            {{ item.groupName }}
          </li>
          <listbox
            :listbox-style="listboxStyle"
            :items="item.items"
            :selected-items="selectedItems"
            @select="onSelect"
          />
        </div>
      </div>
      <div
        v-else
        class="single-area"
      >
        <listbox
          :listbox-style="listboxStyle"
          :items="items"
          :selected-items="selectedItems"
          @select="onSelect"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import listbox from '@/components/selectbox/listbox';

  export default {
    components: {
      listbox,
    },
    props: {
      dropdownStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      isGroup: {
        type: Boolean,
        default: false,
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      items: {
        type: Array,
        default() {
          return [];
        },
      },
      selectedItems: {
        type: Array,
        default() {
          return [];
        },
      },
    },
    data() {
      return {
        listboxStyle: {},
      };
    },
    mounted() {
      // if (this.isGroup) {
      //   this.listboxStyle.paddingLeft = '15px';
      // }
    },
    methods: {
      onSelect(item, target, index) {
        this.$emit('select', item, target, index);
      },
      onKeyUp(e) {
        this.$emit('keyup', e);
      },
    },
  };
</script>
