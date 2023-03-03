<template>
  <div :class="prefixCls">
    <div
      v-if="multiple"
      :class="`${prefixCls}-multiple-input-area`"
    >
      <input
        ref="filterInputField"
        :disabled="disabled"
        type="text"
        class="input-text"
        @keyup="onKeyUp"
      >
    </div>
    <div :class="`${prefixCls}-listbox-wrap`">
      <div
        v-if="isGroup"
        :class="`${prefixCls}-group-area`"
      >
        <div
          v-for="item in items"
          :key="item.groupName"
          class="group-row"
        >
          <li class="title">
            {{ item.groupName }}
          </li>
          <Listbox
            :style="listBoxStyle"
            :is-group="true"
            :size="size"
            :items="item.items"
            :selected-items="selectedItems"
            @before-select="onBeforeSelect"
            @select="onSelect"
          />
        </div>
      </div>
      <div
        v-else
        ref="singleAreaList"
        :class="`${prefixCls}-single-area`"
      >
        <Listbox
          :style="listBoxStyle"
          :items="items"
          :selected-items="selectedItems"
          @before-select="onBeforeSelect"
          @select="onSelect"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Listbox from '@/components/selectbox/listbox';

  const prefixCls = 'ev-dropdown';

  export default {
    components: {
      Listbox,
    },
    props: {
      listBoxStyle: {
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
      size: {
        type: String,
        default: 'medium',
        validator(value) {
          const list = ['small', 'medium', 'large'];
          return list.indexOf(value) > -1;
        },
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
        prefixCls,
      };
    },
    updated() {
      setTimeout(() => {
        if (this.selectedItems.length) {
          const index = this.items.findIndex(item => item.value === this.selectedItems[0].value
            && item.name === this.selectedItems[0].name);
          this.setScrollTop(index);
        }
      });
    },
    methods: {
      getClientHeight(selectedIdx) {
        const defaultRowHeight = 30;
        let listRowHeight = 0;
        if (this.$refs.singleAreaList.children
          && this.$refs.singleAreaList.children[0]
          && this.$refs.singleAreaList.children[0].children[0]
          && this.$refs.singleAreaList.children[0].children[0].children
        ) {
          let li;
          const liList = this.$refs.singleAreaList.children[0].children[0].children;
          if (liList.length < selectedIdx) {
            return defaultRowHeight;
          }
          for (let ix = 0; ix < selectedIdx; ix++) {
            li = liList[ix];
            listRowHeight += li.clientHeight;
          }
        }
        return listRowHeight;
      },
      setScrollTop(selectedIdx) {
        if (!this.isGroup && this.$refs.singleAreaList) {
          const listRowHeight = this.getClientHeight(selectedIdx);
          this.$refs.singleAreaList.scrollTop = listRowHeight;
        }
      },
      onBeforeSelect(item, target, index) {
        this.$emit('before-select', item, target, index);
      },
      onSelect(item, target, index) {
        this.$emit('select', item, target, index);
      },
      onKeyUp(e) {
        this.$emit('keyup', e);
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';
  /**  ev-dropdown  **/
  /**  ev-dropdown > multiple-input-area **/
  /**  ev-dropdown > multiple-input-area > input-text **/

  .ev-dropdown {
    position: absolute;
    width: 100%;
    height: 35px;
    border-radius: $border-radius-base;
    z-index: 850;

    @include evThemify() {
      color: evThemed('font-color-base');
      border: $border-solid evThemed('selectbox-border');
      background-color: evThemed('selectbox-bg');
    }
  }

  .ev-dropdown-multiple-input-area {
    width: 100%;
    height: 100%;
    padding: 3px;
  }

  .ev-dropdown-multiple-input-area .input-text {
    width: 100%;
    height: 100%;
    border: 1px solid #CCCCCC;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
  }

  /**  ev-dropdown > ev-dropdown-listbox-wrap **/
  /**  ev-dropdown > ev-dropdown-listbox-wrap > ev-dropdown-group-area **/
  /**  ev-dropdown > ev-dropdown-listbox-wrap > ev-dropdown-single-area **/

  .ev-dropdown-listbox-wrap {
    width: 100%;
  }

  .ev-dropdown-group-area {
    list-style-type: none;
    width: 100%;
    max-height: 150px;
    border-radius: $border-radius-base;
    overflow: auto;

    @include evThemify() {
      color: evThemed('font-color-base');
      border: $border-solid evThemed('selectbox-border');
      background-color: evThemed('selectbox-bg');
    }

    .title {
      padding: 7px 10px;
    }
  }

  .ev-dropdown-single-area {
    position: absolute;
    width: 100%;
    max-height: 150px;
    border-radius: $border-radius-base;
    overflow: auto;

    @include evThemify() {
      color: evThemed('font-color-base');
      border: $border-solid evThemed('selectbox-border');
      background-color: evThemed('selectbox-bg');
    }
  }
</style>
