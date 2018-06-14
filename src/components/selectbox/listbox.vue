<template>
  <div>
    <slot/>
    <ul
      :style="style"
      class="evui-listbox"
      @click.stop="onClick"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
        :data-index="index"
        class="evui-listbox-item"
      >{{ item.name }}</li>
    </ul>
  </div>
</template>
<script>
  export default {
    props: {
      height: {
        type: Number,
        default: 200,
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
    },
    data() {
      return {
        style: {
          height: `${this.height}px`,
        },
        beforeSelectedTarget: null,
        selectedValues: [],
      };
    },
    methods: {
      onClick(event) {
        const target = event.target;
        const index = +(target.dataset.index);
        const data = this.items[index];

        switch (target.tagName) {
          case 'LI':
            this.$emit('beforedselect', data, target, index);

            if (target.classList.contains('selected')) {
              target.classList.remove('selected');
            } else {
              target.classList.add('selected');
            }

            this.$emit('select', data, target, index);

            if (this.beforeSelectedTarget !== target) {
              this.$emit('change', data, target, index);
            }

            if (
              !this.multiple
              && this.beforeSelectedTarget
              && this.beforeSelectedTarget !== target
            ) {
              this.beforeSelectedTarget.classList.remove('selected');
            }
            this.beforeSelectedTarget = target;

            break;
          default: break;
        }
      },
      getItem() {

      },
    },
  };
</script>
