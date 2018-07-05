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
        left: dataToggleFlag ? dataToggleObj.width - dataToggleObj.height + 1 + 'px' : '0px',
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
    display: inline-block;
    position: relative;
    left: 1px;
    width: 60px;
    height: 24px;
    line-height: 24px;
    vertical-align: middle;
    border: 1px solid #cccccc;
    border-radius: 24px;
    background-color: #cccccc;
    color: #000000;
    transition: all .2s ease-in-out;
    user-select: none;
    cursor: pointer;
  }
  .evui-toggle.active {
    border: 1px solid #2d8cf0;
    background-color: #2d8cf0;
    color: #ffffff;
  }
  .evui-toggle-button {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: all .2s ease-in-out;
    cursor: pointer;
    content: '';
  }
  .evui-toggle-button.active {
    position: absolute;
    top: 1px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: all .2s ease-in-out;
    cursor: pointer;
    content: '';
  }
</style>
