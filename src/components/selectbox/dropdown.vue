<template>
  <div :class="prefixCls">
    <div
      v-if="multiple"
      :class="`${prefixCls}-multiple-input-area`"
    >
      <input
        ref="filterInputText"
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
            @select="onSelect"
          />
        </div>
      </div>
      <div
        v-else
        :class="`${prefixCls}-single-area`"
      >
        <Listbox
          :style="listBoxStyle"
          :items="items"
          :selected-items="selectedItems"
          @select="onSelect"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Listbox from '@/components/selectbox/listbox';

  const prefixCls = 'evui-dropdown';

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

<style scoped>
  /**  evui-dropdown  **/
  /**  evui-dropdown > multiple-input-area **/
  /**  evui-dropdown > multiple-input-area > input-text **/

  .evui-dropdown{
    position: absolute;
    width: 100%;
    height: 35px;
    border: 1px solid #ccc;
    background-color: #fff;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    z-index: 11;
  }
  .evui-dropdown-multiple-input-area{
    width: 100%;
    height: 100%;
    padding: 3px;
  }
  .evui-dropdown-multiple-input-area .input-text{
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
  }

  /**  evui-dropdown > evui-dropdown-listbox-wrap **/
  /**  evui-dropdown > evui-dropdown-listbox-wrap > evui-dropdown-group-area **/
  /**  evui-dropdown > evui-dropdown-listbox-wrap > evui-dropdown-single-area **/

  .evui-dropdown-listbox-wrap {
    width: 100%;
  }
  .evui-dropdown-group-area {
    list-style-type: none;
    width: 100%;
    max-height: 150px;
    border: 1px solid #ccc;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    background: #FFFFFF;
    -webkit-box-shadow: 0 6px 12px #ccc;
    box-shadow: 0 6px 12px #ccc;
    overflow: auto;
  }
  .evui-dropdown-group-area .title {
    padding: 7px 10px;
    color:#999;
  }
  .evui-dropdown-single-area {
    position: absolute;
    min-width: 100%;
    max-height: 150px;
    border: 1px solid #ccc;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    background: #FFFFFF;
    -webkit-box-shadow: 0 6px 12px #ccc;
    box-shadow: 0 6px 12px #ccc;
    overflow: auto;
  }
</style>
