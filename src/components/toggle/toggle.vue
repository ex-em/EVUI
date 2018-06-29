<template>
  <span
    ref="toggleRef"
    :style="{
      width: dataToggleObj.width + 'px',
      height: dataToggleObj.height + 'px',
    }"
    :class="{ active : dataToggleFlag }"
    class="evui-toggle"
    @click="dataToggleFlag = !dataToggleFlag"
  >
    1 {{ dataToggleFlag }}
    <span
      :style="{
        width: dataToggleObj.height - 4 + 'px',
        height: dataToggleObj.height - 4 + 'px',
        left: dataToggleFlag ? 'calc(100% - ' + dataToggleObj.height - 10 + 'px)' : '0px',
      }"
      :class="{ active : dataToggleFlag }"
      class="evui-toggle-button"
    />
  </span>
</template>

<script>
  export default {
    model: {
    },
    props: {
      defaultFlag: {
        type: Boolean,
        default: false,
      },
      toggleObj: {
        type: Object,
        default() {
          return {
            width: 60,
            height: 24,
          };
        },
      },
    },
    data() {
      return {
        dataToggleFlag: this.defaultFlag,
        dataToggleObj: this.toggleObj,
      };
    },
    computed: {
      computedToggleFlag: {
        get() {
          return this.defaultFlag;
        },
        set(flag) {
          this.defaultFlag = flag;
        },
      },
    },
    mounted() {
      /*eslint-disable*/
      console.log('this.$refs.toggleRef : ' + this.$refs.toggleRef);
    },
    methods: {
    },
  };
</script>

<style scoped>
  .evui-toggle {
    height: 24px;
    width: 60px;
    left: 1px;
    line-height: 24px;
    vertical-align: middle;
    border: 1px solid #cccccc;
    background-color: #cccccc;
    position: relative;
    cursor: pointer;
    user-select: none;
    transition: all .2s ease-in-out;
    border-radius: 0px;
    display: inline-block;
    border-radius: 24px;
    color: #000000;
  }
  .evui-toggle.active {
    border: 1px solid #2d8cf0;
    background-color: #2d8cf0;
    color: #ffffff;
  }
  .evui-toggle-button {
    content: '';
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    position: absolute;
    left: 1px;
    top: 1px;
    cursor: pointer;
    transition: all .2s ease-in-out;
  }
  .evui-toggle-button.active {
    content: '';
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    position: absolute;
    top: 1px;
    cursor: pointer;
    transition: all .2s ease-in-out;
  }
</style>
