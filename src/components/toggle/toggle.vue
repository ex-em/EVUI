<template>
  <span
    ref="toggleRef"
    :style="{
      width: dataToggleObj.width + 'px',
      height: dataToggleObj.height + 'px',
      lineHeight: dataToggleObj.height + 'px',
      borderRadius: dataToggleObj.height + 'px',
    }"
    :class="{ active : dataToggleOn }"
    class="evui-toggle"
    @click="changeToggle"
  >
    <p
      v-show="dataToggleText.offText"
      :style="{
        marginRight: dataToggleObj.height/5 + 'px',
        fontSize: dataToggleText.fontSize + 'px',
      }"
      :class="{ active : dataToggleOn }"
      class="offText"
    >
      {{ dataToggleText.offText }}
    </p>
    <p
      v-show="dataToggleText.onText"
      :style="{
        marginLeft: dataToggleObj.height/5 + 'px',
        fontSize: dataToggleText.fontSize + 'px',
      }"
      :class="{ active : dataToggleOn }"
      class="onText"
    >
      {{ dataToggleText.onText }}
    </p>
    <span
      :style="{
        width: dataToggleObj.height - 4 + 'px',
        height: dataToggleObj.height - 4 + 'px',
        left: dataToggleOn ? dataToggleObj.width - dataToggleObj.height + 1 + 'px' : '1px',
      }"
      :class="{ active : dataToggleOn }"
      class="evui-toggle-button"
    />
  </span>
</template>

<script>
  export default {
    model: {
    },
    props: {
      toggleOn: {
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
      toggleSize: {
        type: String,
        default: 'normal',
      },
      toggleText: {
        type: Object,
        default() {
          return {
            onText: '',
            offText: '',
            fontSize: 13,
          };
        },
      },
    },
    data() {
      return {
        dataToggleOn: this.toggleOn,
        dataToggleSize: this.toggleSize,
        dataToggleObj: this.toggleObj,
        dataToggleText: this.toggleText,
      };
    },
    computed: {
    },
    mounted() {
    },
    methods: {
      changeToggle() {
        this.dataToggleOn = !this.dataToggleOn;
        this.$emit('input', this.dataToggleOn);
      },
      initToggle(flag) {
        /*eslint-disable*/
        console.log('flag : ' + flag);
      },
      value1(a) {
        console.log('a : ' + a);
      },
    },
  };
</script>

<style scoped>
  .evui-toggle {
    display: inline-block;
    position: relative;
    vertical-align: middle;
    border: 1px solid #cccccc;
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
    border-radius: 50%;
    background-color: #ffffff;
    transition: all .2s ease-in-out;
    cursor: pointer;
    content: '';
  }
  .evui-toggle-button.active {
    position: absolute;
    top: 1px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: all .2s ease-in-out;
    cursor: pointer;
    content: '';
  }
  .offText {
    display: block;
    float: right;
  }
  .offText.active {
    display: none;
  }
  .onText {
    display: none;
  }
  .onText.active {
    display: block;
    float: left;
  }
</style>
