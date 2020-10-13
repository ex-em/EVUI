<template>
  <div :class="prefixCls">
    <ul
      :class="ulClasses"
      @click.stop="onClick"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
        :data-index="index"
        :title="item.name"
        :class="getLiClasses(item)"
      >
        <ev-icon
          v-if="item.icon"
          :cls="`${item.icon} ${prefixCls}-li-custom-icon`"
        />
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
  const prefixCls = 'ev-listbox';

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

<style lang="scss">
  @import '~@/styles/default';

  .ev-listbox {
    height: 100%;
    word-break: break-all;
    text-align: start;

    @include evThemify() {
      color: evThemed('font-color-base');
    }
  }

  .ev-listbox-ul {
    list-style-type: none;
    padding: 2px 0;
  }

  .ev-listbox-ul-group {
    height: 100%;
  }

  .ev-listbox-li {
    display: block;
    list-style: none;
    cursor: pointer;
    transition: background .1s ease-in-out;

    &-custom-icon {
      padding: 0 5px 0 0;
    }
  }

  .ev-listbox-li:hover:not(.ev-listbox-li-selected) {
    @include evThemify() {
      background-color: evThemed('selectbox-select-bg');
    }
  }

  .ev-listbox-li-selected {
    color: $color-gray8;

    @include evThemify() {
      background-color: evThemed('color-selected');
    }
  }

  .ev-selectbox-size-small .ev-listbox-li,
  .ev-selectbox-size-medium .ev-listbox-li {
    padding: 7px;
  }

  .ev-selectbox-size-large .ev-listbox-li {
    padding: 7px 10px;
  }
</style>
