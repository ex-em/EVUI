<template>
  <div
    class="ev-loadingmask"
  >
    <div
      v-show="barCount"
      ref="loadingCenter"
      class="ev-loadingmask-center"
    >
      <div
        v-for="(item, index) in barData"
        :key="index"
        :style="{
          position: 'absolute',
          width: `${item.barWidth}px`,
          height: `${item.barHeight}px`,
          borderRadius: `${item.barBorderRadius}px`,
          background: `${item.barColor}`,
          transform: `${item.transform}`,
          animation: `${item.animation}`,
          animationDelay: `${item.animDelay}`,
        }"
      />
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      barWidth: { // 바 너비
        type: Number,
        default: 30,
      },
      barHeight: { // 바 높이
        type: Number,
        default: 10,
      },
      barBorderRadius: { // 바 테두리 둥근정도
        type: Number,
        default: 20,
      },
      barColor: { // 바 색상
        type: String,
        default: 'rgba(200, 200, 200, 0.7)',
      },
      barCount: { // 로딩 바의 개수
        type: Number,
        default: 13,
      },
      spinnerRadius: { // 중앙점에서부터 로딩 바까지의 반지름
        type: Number,
        default: 30,
      },
      animInterval: { // css animation seconds during 1-time
        type: Number,
        default: 1,
      },
    },
    data() {
      return {
        barData: [],
      };
    },
    computed: {
    },
    watch: {
    },
    created() {
      for (let ix = 0, ixLen = this.barCount; ix < ixLen; ix++) {
        const obj = {};
        const deg = Math.round(360 * (ix / ixLen));
        obj.position = 'absolute';
        obj.barWidth = this.barWidth;
        obj.barHeight = this.barHeight;
        obj.barBorderRadius = this.barBorderRadius;
        obj.barColor = this.barColor;
        obj.transform = `rotate(${deg}deg) translate(${this.spinnerRadius + (this.barWidth / 2)}px, 0px)`;
        obj.animation = `ev-loadingmask-fadedelay ${this.animInterval}s infinite ease-in-out`;
        obj.animDelay = `${(this.animInterval * (ix / ixLen)).toFixed(3)}s`;
        this.barData.push(obj);
      }
    },
    mounted() {
      setTimeout(this.updatePosition.bind(this), 1);
    },
    methods: {
      updatePosition() {
        const element = this.$el;
        const parentEl = element.parentElement;
        if (parentEl) {
          const getComputedParent = getComputedStyle(parentEl);
          if (getComputedParent) {
            const parentPaddingTop = getComputedParent.getPropertyValue('padding-top');
            const parentPaddingLeft = getComputedParent.getPropertyValue('padding-left');
            const parentBorder = getComputedParent.getPropertyValue('border-width');
            const parentElRect = parentEl.getBoundingClientRect();
            const parentWidth =
              parentElRect.width - (parseInt(parentBorder, 10) * 2);
            const parentHeight =
              parentElRect.height - (parseInt(parentBorder, 10) * 2);
            const wrapperTransform =
              `translate(-${parentPaddingLeft}, -${parentPaddingTop})`;
            this.$el.setAttribute('style',
              `width: ${parentWidth}px; height: ${parentHeight}px; transform: ${wrapperTransform}`);
            const centerTransform =
              `translate(-${(this.barWidth / 2)}px, -${(this.barHeight / 2)}px)`;
            this.$refs.loadingCenter.setAttribute('style',
              `top: ${parentHeight / 2}px; left: ${parentWidth / 2}px; transform: ${centerTransform}`);
          }
        }
      },
    },
  };
</script>

<style>
  .ev-loadingmask {
    position: absolute;
    overflow: hidden;
    z-index: 500;
  }
  .ev-loadingmask-center {
    position: relative;
  }
  @keyframes ev-loadingmask-fadedelay {
    80% {
      -webkit-opacity: 0.2;
      opacity: 0.2;
    }
    100% {
      -webkit-opacity: 0.9;
      opacity: 0.9;
    }
  }
</style>
