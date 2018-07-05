<template>
  <div
    class="evui-listbox"
    :style="listboxStyle"
  >
    <ul
      class="evui-listbox-ul"
      @click.stop="onClick"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
        :data-index="index"
        :class="getLiClass(item)"
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
    },
    methods: {
      onClick(event) {
        const target = event.target;
        const index = +(target.dataset.index);
        const item = this.items[index];

        switch (target.tagName) {
          case 'LI':
            this.$emit('beforedselect', item, target, index);
            this.$emit('select', item, target, index);
            break;
          default:
            break;
        }
      },
      getLiClass(item) {
        const classList = ['evui-listbox-li'];
        const findedItem = this.selectedItems.find(obj => obj.name === item.name);

        if (findedItem) {
          classList.push('selected');
        }

        return classList;
      },
    },
  };
</script>
