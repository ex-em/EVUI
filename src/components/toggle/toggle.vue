<template>
  <div
    ref="toggleRef"
    :class="[toggleType, {active : dataToggleOn}]"
    class="ev-toggle"
    @click="changeToggle"
  >
    <span
      v-if="toggleType === 'slide'"
      v-show="toggleText.offText"
      ref="offTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
      }"
      class="ev-toggle-offText-slide"
    >
      {{ toggleText.offText }}
    </span>
    <span
      v-if="toggleType === 'slide'"
      v-show="toggleText.onText"
      ref="onTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
      }"
      class="ev-toggle-onText-slide"
    >
      {{ toggleText.onText }}
    </span>
    <div
      v-show="isShow"
      v-if="toggleType === 'slide'"
      ref="toggleSwitch"
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
    <span
      v-if="toggleType === 'button'"
      ref="onTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
      }"
      class="ev-toggle-onText-button"
    >
      {{ toggleText.onText }}
    </span>
    <span
      v-if="toggleType === 'button'"
      ref="offTextRef"
      :style="{
        fontSize: toggleFontSize + 'px',
      }"
      class="ev-toggle-offText-button"
    >
      {{ toggleText.offText }}
    </span>
  </div>
</template>

<script>
  export default {
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
            width: 80,
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
    watch: {
      toggleText: {
        async handler() {
          await this.setToggleStyle();
          await this.setToggleButtonStyle();
        },
        deep: true,
      },
      dataToggleOn() {
        this.setToggleButtonStyle();
      },
    },
    mounted() {
      setTimeout(async () => {
        await this.setToggleStyle();
        await this.setToggleButtonStyle();
        this.isShow = true;
      });
    },
    methods: {
      setToggleStyle() {
        if (this.toggleText.onText || this.toggleText.offText) {
          let maxTextWidth = 0;
          const onTextWidth = Math.ceil(this.$refs.onTextRef.getBoundingClientRect().width);
          const offTextWidth = Math.ceil(this.$refs.offTextRef.getBoundingClientRect().width);
          const wrapperWidth = Math.ceil(this.$refs.toggleRef.getBoundingClientRect().width);
          if (this.toggleType === 'slide') {
            maxTextWidth = offTextWidth < onTextWidth ? onTextWidth : offTextWidth;
            if (wrapperWidth - maxTextWidth !== 60) {
              if (maxTextWidth < this.toggleObj.width - 60) {
                this.maxWidth = this.toggleObj.width;
              } else {
                this.maxWidth = maxTextWidth + 60;
              }
            } else {
              this.maxWidth = wrapperWidth;
            }
          }
        } else {
          this.maxWidth = this.toggleObj.width;
        }

        let toggleWrapStyle = {};
        if (this.toggleType === 'tab') {
          toggleWrapStyle = {
            width: 'auto',
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
            width: 'auto',
            height: `${this.toggleObj.height}px`,
            lineHeight: `${this.toggleObj.height}px`,
            borderRadius: '4px',
          };
        }

        for (let ix = 0, ixLen = Object.keys(toggleWrapStyle).length; ix < ixLen; ix++) {
          this.$refs.toggleRef.style[Object.keys(toggleWrapStyle)[ix]]
            = toggleWrapStyle[Object.keys(toggleWrapStyle)[ix]];
        }
      },
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
              left: this.dataToggleOn ? 'auto' : '1px',
              right: this.dataToggleOn ? '1px' : '0',
            };
          } else {
            toggleButtonStyle = {
              width: `${this.toggleObj.height - 4}px`,
              height: `${this.toggleObj.height - 4}px`,
              left: this.dataToggleOn ? 'auto' : '1px',
              right: this.dataToggleOn ? '1px' : '0',
              borderRadius: '50%',
            };
          }
        }
        for (let ix = 0, ixLen = Object.keys(toggleButtonStyle).length; ix < ixLen; ix++) {
          this.$refs.toggleSwitch.style[Object.keys(toggleButtonStyle)[ix]]
            = toggleButtonStyle[Object.keys(toggleButtonStyle)[ix]];
        }
      },
    },
  };
</script>

<style scoped>
  .ev-toggle.slide {
    display: inline-block;
    position: relative;
    vertical-align: middle;
    border: 1px solid #CCCCCC;
    background-color: #CCCCCC;
    color: #000000;
    transition: all .2s ease-in-out;
    user-select: none;
    cursor: pointer;
  }
  .ev-toggle.slide.active {
    border: 1px solid #2D8CF0;
    background-color: #2D8CF0;
    color: #FFFFFF;
  }
  .ev-toggle.tab {
    display: inline-flex;
    position: relative;
    border: 1px solid #2D8CF0;
    user-select: none;
    cursor: pointer;
  }
  .ev-toggle.button {
    display: inline-block;
    position: relative;
    border: 0;
    padding: 0 10px 0 10px;
    background-color: #2D8CF0;
    color: #FFFFFF;
    user-select: none;
    cursor: pointer;
  }
  .ev-toggle-switch {
    position: absolute;
    top: 1px;
    background-color: #FFFFFF;
    transition-duration: 0.5s;
    cursor: pointer;
    content: '';
  }
  .ev-toggle-offText-slide {
    display: inline-block;
    height: 0;
    margin-right: 10px;
    visibility: visible;
    float: right;
  }
  .active > .ev-toggle-offText-slide {
    visibility: hidden;
  }
  .ev-toggle-onText-slide {
    height: 0;
    margin-left: 10px;
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
    width: auto;
    height: 100%;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    background-color: #F7F7F7;
    padding: 0 10px 0 10px;
    color: #000000;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    transition: all .2s ease-in-out;
  }
  .active > .ev-toggle-offText-tab {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background-color: #2D8CF0;
    color: #FFFFFF;
  }
  .ev-toggle-onText-tab {
    display: inline-block;
    float: left;
    width: auto;
    height: 100%;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    background-color: #2D8CF0;
    padding: 0 10px 0 10px;
    color: #FFFFFF;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    transition: all .2s ease-in-out;
  }
  .active > .ev-toggle-onText-tab {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: #F7F7F7;
    color: #000000;
  }
  .ev-toggle-onText-button {
    display: block;
    left: 0;
    right: 0;
    height: 0;
    visibility: hidden;
  }
  .active > .ev-toggle-onText-button {
    text-align: center;
    visibility: visible;
  }
  .ev-toggle-offText-button {
    display: block;
    left: 0;
    right: 0;
    height: 0;
    text-align: center;
    visibility: visible;
  }
  .active > .ev-toggle-offText-button {
    visibility: hidden;
  }
</style>
