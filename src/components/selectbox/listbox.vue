<template>
  <div class="prefixCls">
    <ul
      :class="ulClasses"
      @click.stop="onClick"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
        :data-index="index"
        :class="getLiClasses(item)"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
  const prefixCls = 'evui-listbox';

  export default {
    props: {
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
        ulClasses: '',
      };
    },
    created() {
      this.ulClasses = this.isGroup ? `${prefixCls}-ul-group` : `${prefixCls}-ul`;
    },
    methods: {
      onClick(event) {
        const target = event.target;
        const index = +(target.dataset.index);
        const item = this.items[index];

        switch (target.tagName) {
          case 'LI':
            this.$emit('before-select', item, target, index);
            this.$emit('select', item, target, index);
            break;
          default:
            break;
        }
      },
      getLiClasses(item) {
        const foundItem = this.selectedItems.find(obj => obj.name === item.name);

        return {
          [`${prefixCls}-li`]: true,
          [`${prefixCls}-li-selected`]: !!foundItem,
        };
      },
    },
  };
</script>

<style scoped>
  .evui-listbox{
    width: 100%;
    height: 100%;
  }
  .evui-listbox-ul{
    list-style-type: none;
    padding: 2px 0;
  }
  .evui-listbox-ul-group{
    height: 100%;
  }
  .evui-listbox-li{
    display: block;
    list-style: none;
    color: #495060;
    white-space: nowrap;
    cursor: pointer;
    transition: background .1s ease-in-out;
  }
  .evui-listbox-li:hover:not(.evui-listbox-li-selected){
    background-color: #eeeeee;
  }
  .evui-listbox-li-selected {
    color: #fff;
    background-color: #337ab6;
  }

  .evui-selectbox-size-small .evui-listbox-li { padding: 7px; }
  .evui-selectbox-size-medium .evui-listbox-li { padding: 7px; }
  .evui-selectbox-size-large .evui-listbox-li { padding: 7px 10px; }
</style>
