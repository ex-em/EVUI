<template>
  <div>
    <div
      :class="classes"
      @click="onClick"
    >
      <ev-icon
        v-if="firstIcon"
        :cls="firstIcon"
        style="margin-right: 5px"
      />
      {{ name }}
      <ev-icon
        v-if="lastIcon"
        :cls="lastIcon"
        style="margin-left: auto;"
      />
      <template v-if="children.length">
        <ev-icon
          v-if="isExpanded"
          :key="'down'"
          :cls="'ei-s ei-arrow-down'"
          style="margin-left: auto;"
        />
        <ev-icon
          v-else
          :key="'up'"
          :cls="'ei-s ei-arrow-up'"
          style="margin-left: auto;"
        />
      </template>
    </div>
    <template v-if="isExpanded">
      <sub-menu
        v-if="children.length"
        :menu="children"
        :depth="depth + 1"
        :selected-name="selectedName"
        @menu-click="onEmitClick"
      />
    </template>
  </div>
</template>
<script>
  export default {
    components: {
      SubMenu: () => import('./menu.nav.sub'),
    },
    props: {
      name: {
        type: String,
        default: '',
      },
      firstIcon: {
        type: String,
        default: '',
      },
      lastIcon: {
        type: String,
        default: '',
      },
      children: {
        type: Array,
        default: () => [],
      },
      selectedName: {
        type: String,
        default: '',
      },
      active: {
        type: Boolean,
        default: true,
      },
      depth: {
        type: Number,
        default: 1,
      },
    },
    data() {
      return {
        isExpanded: true,
      };
    },
    computed: {
      classes() {
        return [
          'ev-menu-item',
          'wrap',
          {
            bold: this.children.length,
            active: this.active,
            selected: !this.children.length && this.name === this.selectedName,
          },
        ];
      },
    },
    methods: {
      onClick() {
        if (this.children.length) {
          this.isExpanded = !this.isExpanded;
        } else {
          this.$emit('menu-click', this.name);
        }
      },
      onEmitClick(name) {
        this.$emit('menu-click', name);
      },
    },
  };
</script>
<style scoped>
  .wrap {
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
  }
  .wrap.selected {
    background: #438DF3;
    color: white;
  }
  .wrap.bold {
    font-weight: bold;
  }
</style>
