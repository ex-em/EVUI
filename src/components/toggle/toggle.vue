<template>
  <div
    ref="toggleRef"
    :class="[toggleType, {active : dataToggleOn}]"
    class="ev-toggle"
    @click="changeToggle"
  >
    <div
      v-if="toggleType === 'slide'"
      v-show="toggleText.offText"
      ref="offTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
        marginRight: toggleObj.height/5 + 'px',
      }"
      class="ev-toggle-offText-slide"
    >
      {{ toggleText.offText }}
    </div>
    <div
      v-if="toggleType === 'slide'"
      v-show="toggleText.onText"
      ref="onTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
        marginLeft: toggleObj.height/5 + 'px',
      }"
      class="ev-toggle-onText-slide"
    >
      {{ toggleText.onText }}
    </div>
    <div
      v-show="isShow"
      v-if="toggleType === 'slide'"
      :style="setToggleButtonStyle()"
      class="ev-toggle-switch"
    />
    <div
      v-if="toggleType === 'tab'"
      ref="offTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
      }"
      class="ev-toggle-offText-tab"
    >
      {{ toggleText.onText }}
    </div>
    <div
      v-if="toggleType === 'tab'"
      ref="onTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
      }"
      class="ev-toggle-onText-tab"
    >
      {{ toggleText.offText }}
    </div>
    <div
      v-if="toggleType === 'button'"
      ref="onTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
      }"
      class="ev-toggle-onText-button"
    >
      {{ toggleText.onText }}
    </div>
    <div
      v-if="toggleType === 'button'"
      ref="offTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
      }"
      class="ev-toggle-offText-button"
    >
      {{ toggleText.offText }}
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
      toggleText: {
        type: Object,
        default() {
          return {
            onText: '',
            offText: '',
          };
        },
      },
      toggleFontSize: {
        type: Number,
        default: 11,
      },
    },
    data() {
      return {
        dataToggleOn: this.value,
        maxWidth: 0,
        isShow: false,
      };
    },
    computed: {
    },
    mounted() {
      if (this.toggleText.onText || this.toggleText.offText) {
        let maxTextWidth = 0;
        const onTextScrollWidth = this.$refs.onTextRef.scrollWidth;
        const offTextScrollWidth = this.$refs.offTextRef.scrollWidth;
        if (this.toggleType === 'slide' || this.toggleType === 'button') {
          if (offTextScrollWidth < onTextScrollWidth) {
            maxTextWidth = onTextScrollWidth;
          } else {
            maxTextWidth = offTextScrollWidth;
          }
        } else if (this.toggleType === 'tab') {
          if (offTextScrollWidth < onTextScrollWidth) {
            maxTextWidth = onTextScrollWidth * 2;
          } else {
            maxTextWidth = offTextScrollWidth * 2;
          }
        }
        if (maxTextWidth + (this.toggleObj.height * 1.5) < this.toggleObj.width) {
          this.maxWidth = this.toggleObj.width;
        } else {
          this.maxWidth = maxTextWidth + (this.toggleObj.height * 1.5);
        }
      } else {
        this.maxWidth = this.toggleObj.width;
      } // 최대 너비 구하기

      let toggleWrapStyle = {};
      if (this.toggleType === 'tab') {
        toggleWrapStyle = {
          width: `${this.maxWidth}px`,
          height: `${this.toggleObj.height}px`,
          lineHeight: `${this.toggleObj.height}px`,
          borderRadius: '4px',
        };
      } else if (this.toggleType === 'slide') {
        if (this.toggleShape === 'square') {
          toggleWrapStyle = {
            width: `${this.maxWidth}px`,
            height: `${this.toggleObj.height}px`,
            lineHeight: `${this.toggleObj.height}px`,
            borderRadius: '3px',
          };
        } else if (this.toggleShape === 'circle') {
          toggleWrapStyle = {
            width: `${this.maxWidth}px`,
            height: `${this.toggleObj.height}px`,
            lineHeight: `${this.toggleObj.height}px`,
            borderRadius: `${this.toggleObj.height}px`,
          };
        }
      } else if (this.toggleType === 'button') {
        toggleWrapStyle = {
          width: `${this.maxWidth}px`,
          height: `${this.toggleObj.height}px`,
          lineHeight: `${this.toggleObj.height}px`,
          borderRadius: '4px',
        };
      } // type별로 style setting

      for (let ix = 0, ixLen = Object.keys(toggleWrapStyle).length; ix < ixLen; ix++) {
        this.$refs.toggleRef.style[Object.keys(toggleWrapStyle)[ix]]
          = toggleWrapStyle[Object.keys(toggleWrapStyle)[ix]];
      } // style 속성 부여

      const self = this;
      this.$nextTick(() => {
        setTimeout(() => {
          self.isShow = true;
        });
      });
    },
    methods: {
      changeToggle() {
        this.dataToggleOn = !this.dataToggleOn;
        this.$emit('input', this.dataToggleOn);
      },
      setToggleButtonStyle() {
        let toggleButtonStyle = {};
        if (this.toggleType === 'slide') {
          if (this.toggleShape === 'square') {
            toggleButtonStyle = {
              width: `${this.toggleObj.height - 4}px`,
              height: `${this.toggleObj.height - 4}px`,
              left: this.dataToggleOn ? `${(this.maxWidth - this.toggleObj.height) + 1}px` : '1px',
            };
          } else {
            toggleButtonStyle = {
              width: `${this.toggleObj.height - 4}px`,
              height: `${this.toggleObj.height - 4}px`,
              left: this.dataToggleOn ? `${(this.maxWidth - this.toggleObj.height) + 1}px` : '1px',
              borderRadius: '50%',
            };
          }
        }
        return toggleButtonStyle;
      },
    },
  };
</script>

<style scoped>
  .ev-toggle.slide {
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
  .ev-toggle.slide.active {
    border: 1px solid #2d8cf0;
    background-color: #2d8cf0;
    color: #ffffff;
  }
  .ev-toggle.tab {
    display: inline-block;
    position: relative;
    border: 1px solid #2d8cf0;
    user-select: none;
    cursor: pointer;
  }
  .ev-toggle.button {
    display: inline-block;
    position: relative;
    border: 1px solid #2d8cf0;
    background-color: #2d8cf0;
    color: #ffffff;
    user-select: none;
    cursor: pointer;
  }
  .ev-toggle-switch {
    position: absolute;
    top: 1px;
    background-color: #ffffff;
    transition: all .2s ease-in-out;
    cursor: pointer;
    content: '';
  }
  .active > .ev-toggle-switch {
    position: absolute;
    top: 1px;
    background-color: #ffffff;
    transition: all .2s ease-in-out;
    cursor: pointer;
    content: '';
  }
  .ev-toggle-offText-slide {
    display: inline-block;
    height: 0;
    visibility: visible;
    float: right;
  }
  .active > .ev-toggle-offText-slide {
    visibility: hidden;
  }
  .ev-toggle-onText-slide {
    height: 0;
    visibility: hidden;
  }
  .active > .ev-toggle-onText-slide {
    display: inline-block;
    visibility: visible;
    float: left;
  }
  .ev-toggle-offText-tab {
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
  .active > .ev-toggle-offText-tab {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background-color: #2d8cf0;
    color: #ffffff;
  }
  .ev-toggle-onText-tab {
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
  .active > .ev-toggle-onText-tab {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: #f7f7f7;
    color: #000000;
  }
  .ev-toggle-onText-button {
    display: block;
    height: 0px;
    visibility: hidden;
  }
  .active > .ev-toggle-onText-button {
    text-align: center;
    visibility: visible;
  }
  .ev-toggle-offText-button {
    display: block;
    height: 0px;
    text-align: center;
    visibility: visible;
  }
  .active > .ev-toggle-offText-button {
    visibility: hidden;
  }
</style>
