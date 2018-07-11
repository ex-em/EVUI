<template>
  <div
    :style="computedToggleWrapStyle"
    :class="[toggleTypeClass, {active : dataToggleOn}]"
    @click="changeToggle"
  >
    <div
      v-if="toggleType === 'slide'"
      v-show="dataToggleText.offText"
      ref="offTextRef"
      :style="{
        fontSize: dataToggleText.fontSize + 'px',
        marginRight: dataToggleObj.height/5 + 'px',
      }"
      :class="{ active : dataToggleOn }"
      class="evui-toggle-offText-slide"
    >
      {{ dataToggleText.offText }}
    </div>
    <div
      v-if="toggleType === 'slide'"
      v-show="dataToggleText.onText"
      ref="onTextRef"
      :style="{
        fontSize: dataToggleText.fontSize + 'px',
        marginLeft: dataToggleObj.height/5 + 'px',
      }"
      :class="{ active : dataToggleOn }"
      class="evui-toggle-onText-slide"
    >
      {{ dataToggleText.onText }}
    </div>
    <div
      v-if="toggleType === 'slide'"
      :style="computedToggleButtonStyle"
      :class="{ active : dataToggleOn }"
      class="evui-toggle-switch"
    />
    <div
      v-if="toggleType === 'tab'"
      ref="offTextRef"
      :style="{
        fontSize: dataToggleText.fontSize + 'px',
      }"
      class="evui-toggle-offText-tab"
    >
      {{ dataToggleText.onText }}
    </div>
    <div
      v-if="toggleType === 'tab'"
      ref="onTextRef"
      :style="{
        fontSize: dataToggleText.fontSize + 'px',
      }"
      class="evui-toggle-onText-tab"
    >
      {{ dataToggleText.offText }}
    </div>
    <div
      v-if="toggleType === 'button'"
      ref="onTextRef"
      class="evui-toggle-onText-button"
    >
      {{ dataToggleText.onText }}
    </div>
    <div
      v-if="toggleType === 'button'"
      ref="offTextRef"
      class="evui-toggle-offText-button"
    >
      {{ dataToggleText.offText }}
    </div>
  </div>
</template>

<script>
  export default {
    model: {
    },
    props: {
      value: {
        type: Boolean,
        default: false,
      },
      toggleShape: {
        type: String,
        default: 'circle',
      },
      toggleType: {
        type: String,
        default: 'slide',
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
            fontSize: 11,
          };
        },
      },
    },
    data() {
      return {
        toggleTypeClass: this.setToggleTypeClass(),
        dataToggleOn: this.value,
        dataToggleType: this.toggleType,
        dataToggleShape: this.toggleShape,
        dataToggleSize: this.toggleSize,
        dataToggleObj: this.toggleObj,
        toggleWrapStyle: {},
        dataToggleText: this.toggleText,
        maxTextWidth: '',
      };
    },
    computed: {
      computedToggleWrapStyle() {
        let toggleWrapStyle = {};
        if (this.maxTextWidth !== '') {
          let maxWidth = 0;
          if (this.maxTextWidth + (this.toggleObj.height * 1.5) < this.toggleObj.width) {
            maxWidth = this.toggleObj.width;
          } else {
            maxWidth = this.maxTextWidth + (this.toggleObj.height * 1.5);
          }
          if (this.dataToggleType === 'tab') {
            toggleWrapStyle = {
              width: `${maxWidth}px`,
              height: `${this.toggleObj.height}px`,
              lineHeight: `${this.toggleObj.height}px`,
              borderRadius: '4px',
            };
          } else if (this.dataToggleType === 'slide') {
            if (this.dataToggleShape === 'square') {
              toggleWrapStyle = {
                width: `${maxWidth}px`,
                height: `${this.toggleObj.height}px`,
                lineHeight: `${this.toggleObj.height}px`,
                borderRadius: '3px',
              };
            } else {
              toggleWrapStyle = {
                width: `${maxWidth}px`,
                height: `${this.toggleObj.height}px`,
                lineHeight: `${this.toggleObj.height}px`,
                borderRadius: `${this.toggleObj.height}px`,
              };
            }
          } else if (this.dataToggleType === 'button') {
            toggleWrapStyle = {
              width: `${maxWidth}px`,
              height: `${this.toggleObj.height}px`,
              lineHeight: `${this.toggleObj.height}px`,
              borderRadius: '4px',
            };
          }
        }
        return toggleWrapStyle;
      },
      computedToggleButtonStyle() {
        let toggleButtonStyle = {};
        let maxWidth = 0;
        if (this.maxTextWidth + (this.toggleObj.height * 1.5) < this.toggleObj.width) {
          maxWidth = this.toggleObj.width;
        } else {
          maxWidth = this.maxTextWidth + (this.toggleObj.height * 1.5);
        }
        if (this.dataToggleType === 'slide') {
          if (this.dataToggleShape === 'square') {
            toggleButtonStyle = {
              width: `${this.dataToggleObj.height - 4}px`,
              height: `${this.dataToggleObj.height - 4}px`,
              left: this.dataToggleOn ? `${(maxWidth - this.dataToggleObj.height) + 1}px` : '1px',
            };
          } else {
            toggleButtonStyle = {
              width: `${this.dataToggleObj.height - 4}px`,
              height: `${this.dataToggleObj.height - 4}px`,
              left: this.dataToggleOn ? `${(maxWidth - this.dataToggleObj.height) + 1}px` : '1px',
              borderRadius: '50%',
            };
          }
        }
        return toggleButtonStyle;
      },
    },
    mounted() {
      if (this.$refs.offTextRef && this.$refs.onTextRef
        && this.$refs.offTextRef.scrollWidth && this.$refs.onTextRef.scrollWidth) {
        if (this.dataToggleType === 'slide') {
          if (this.$refs.offTextRef.scrollWidth < this.$refs.onTextRef.scrollWidth) {
            this.maxTextWidth = this.$refs.onTextRef.scrollWidth;
          } else {
            this.maxTextWidth = this.$refs.offTextRef.scrollWidth;
          }
        } else if (this.dataToggleType === 'tab') {
          if (this.$refs.offTextRef.scrollWidth < this.$refs.onTextRef.scrollWidth) {
            this.maxTextWidth = this.$refs.onTextRef.scrollWidth * 2;
          } else {
            this.maxTextWidth = this.$refs.offTextRef.scrollWidth * 2;
          }
        } else if (this.dataToggleType === 'button') {
          if (this.$refs.offTextRef.scrollWidth < this.$refs.onTextRef.scrollWidth) {
            this.maxTextWidth = this.$refs.onTextRef.scrollWidth;
          } else {
            this.maxTextWidth = this.$refs.offTextRef.scrollWidth;
          }
        }
      } else {
        this.maxTextWidth = 0;
      }
    },
    methods: {
      changeToggle() {
        this.dataToggleOn = !this.dataToggleOn;
        this.$emit('input', this.dataToggleOn);
      },
      setToggleTypeClass() {
        let cls = 'evui-toggle-slide';
        if (this.toggleType === 'slide') {
          cls = 'evui-toggle-slide';
        } else if (this.toggleType === 'tab') {
          cls = 'evui-toggle-tab';
        } else if (this.toggleType === 'button') {
          cls = 'evui-toggle-button';
        }
        return cls;
      },
    },
  };
</script>

<style scoped>
  .evui-toggle-slide {
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
  .evui-toggle-slide.active {
    border: 1px solid #2d8cf0;
    background-color: #2d8cf0;
    color: #ffffff;
  }
  .evui-toggle-tab {
    display: inline-block;
    position: relative;
    border: 1px solid #2d8cf0;
  }
  .evui-toggle-button {
    display: inline-block;
    position: relative;
    border: 1px solid #2d8cf0;
    background-color: #2d8cf0;
    color: #ffffff;
  }
  .evui-toggle-switch {
    position: absolute;
    top: 1px;
    background-color: #ffffff;
    transition: all .2s ease-in-out;
    cursor: pointer;
    content: '';
  }
  .evui-toggle-switch.active {
    position: absolute;
    top: 1px;
    background-color: #ffffff;
    transition: all .2s ease-in-out;
    cursor: pointer;
    content: '';
  }
  .evui-toggle-offText-slide {
    display: inline-block;
    height: 0px;
    visibility: visible;
    float: right;
  }
  .evui-toggle-offText-slide.active {
    visibility: hidden;
  }
  .evui-toggle-onText-slide {
    height: 0px;
    visibility: hidden;
  }
  .evui-toggle-onText-slide.active {
    display: inline-block;
    visibility: visible;
    float: left;
  }
  .evui-toggle-offText-tab {
    display: inline-block;
    float: left;
    width: 50%;
    height: 100%;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    background-color: #f7f7f7;
    color: #000000;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    transition: all .2s ease-in-out;
  }
  .active > .evui-toggle-offText-tab {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    background-color: #2d8cf0;
    color: #ffffff;
  }
  .evui-toggle-onText-tab {
    display: inline-block;
    float: left;
    width: 50%;
    height: 100%;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    background-color: #2d8cf0;
    color: #ffffff;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    transition: all .2s ease-in-out;
  }
  .active > .evui-toggle-onText-tab {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: #f7f7f7;
    color: #000000;
  }
  .evui-toggle-onText-button {
    display: block;
    height: 0px;
    visibility: hidden;
  }
  .active > .evui-toggle-onText-button {
    visibility: visible;
  }
  .evui-toggle-offText-button {
    display: block;
    height: 0px;
    visibility: visible;
  }
  .active > .evui-toggle-offText-button {
    visibility: hidden;
  }
</style>
