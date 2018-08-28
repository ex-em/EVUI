<template>
  <div
    :class="activeClass"
    @click.stop="setActive"
  >
    <li class="tab-title"> {{ tabData.title }}
      <span
        class="btn-close"
        @click.stop="close"
      > &times;
      </span>
    </li>
  </div>
</template>

<script>
  const prefixCls = 'tab-title';

  export default {
    props: {
      tabData: {
        type: Object,
        default() {
          return {};
        },
      },
    },
    data() {
      return {
        isActive: this.tabData.isActive,
      };
    },
    computed: {
      activeClass() {
       return [
          `${prefixCls}-outer`,
          {
            active: this.tabData.isActive,
          },
        ];
      },
    },
    methods: {
      close() {
        this.$emit('close', this.tabData);
      },
      setActive() {
        this.$emit('set-active', this.tabData);
      },
    },
  };
</script>

<style scoped>
  .tab-title-outer {
    float: left;
    transition: .1s all ease-in-out;
    border: 1px solid;
    border-bottom: 2px solid;
    border-color: #CBD3EA;
    border-bottom-color: transparent;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    border-bottom-left-radius: 1px;
    padding-left: 1px;
    padding-right: 1px;
    margin-right: 1px;
  }
  .tab-title-outer.active {
    border-bottom-color: #ffffff;
    box-shadow:inset -1px 1px 2px -1px #2589E9;
  }
  .tab-title-outer:hover {
    color: #2589E9;
    font-weight: bold;
    cursor: pointer;
  }
  .tab-title {
    margin: 5px;
    padding: 5px;
  }
  .btn-close {
    position: relative;
    top: -9px;
    left: 5px;
  }

  .tab-title-outer:hover .btn-close:hover {
    color: red;
    font-weight: bold;
    cursor: pointer;
  }
</style>
