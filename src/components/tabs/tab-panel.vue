<template>
  <div
    v-if="loaded || isActive"
    v-show="isActive"
    class="ev-tab-panel"
  >
    <slot />
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        type: String,
        default: '',
      },
      preload: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        loaded: this.preload,
      };
    },
    computed: {
      isActive() {
        const active = this.$parent.activeTab === this.value;

        if (active && !this.loaded) {
          this.loaded = true; // eslint-disable-line vue/no-side-effects-in-computed-properties
        }

        return active;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .ev-tab-panel {
    width: 100%;
    height: 100%;
  }
</style>
