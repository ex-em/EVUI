<template>
  <div
    :style="listboxStyle"
    class="evui-listbox"
  >
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
  export default {
    props: {
      listboxStyle: {
        type: Object,
        default() {
          return {};
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
      isGroup: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        ulClasses: '',
      };
    },
    created() {
      this.ulClasses = this.isGroup ? 'evui-listbox-ul-group' : 'evui-listbox-ul';
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
        const classList = [];
        const foundItem = this.selectedItems.find(obj => obj.name === item.name);

        classList.push('evui-listbox-li');

        if (foundItem) {
          classList.push('selected');
        }

        return classList;
      },
    },
  };
</script>

<style scoped>
  .evui-listbox{
    width: 100%;
    height: 100%
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
    padding: 7px 16px;
    color: #495060;
    white-space: nowrap;
    cursor: pointer;
    transition: background .1s ease-in-out;
  }
  .evui-listbox-li:hover{
    background-color: #eeeeee;
  }
  .evui-listbox-li.selected{
    color: #fff;
    background-color: #337ab6;
  }
</style>
