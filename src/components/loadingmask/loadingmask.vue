<template>
  <div
    v-if="isShow"
    class="ev-loadingmask"
  >
    <div
      v-show="barCount"
      ref="contents"
      class="ev-loadingmask-center"
    >
      <div
        v-for="(item, index) in barData"
        :key="index"
        :style="{
          position: 'absolute',
          width: item.width,
          height: item.height,
          borderRadius: item.borderRadius,
          background: item.barColor,
          transform: item.transform,
          animation: item.animation,
          animationDelay: item.animDelay,
        }"
      />
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      width: { // 바 너비
        type: String,
        default: '30px',
      },
      height: { // 바 높이
        type: String,
        default: '10px',
      },
      borderRadius: { // 바 테두리 둥근정도
        type: String,
        default: '20px',
      },
      barColor: { // 바 색상
        type: String,
        default: 'rgba(200, 200, 200, 0.7)',
      },
      barCount: { // 로딩 바의 개수
        type: Number,
        default: 13,
      },
      fadebarRadius: { // 중앙점에서부터 로딩 바까지의 반지름
        type: String,
        default: '45px',
      },
      animInterval: { // css animation seconds during 1-time
        type: Number,
        default: 1,
      },
      isShow: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        barData: [],
      };
    },
    watch: {
      isShow(value) {
        if (value) {
          setTimeout(this.updatePosition.bind(this), 1);
        }
      },
    },
    created() {
      for (let ix = 0, ixLen = this.barCount; ix < ixLen; ix++) {
        const obj = {};
        const deg = Math.round(360 * (ix / ixLen));
        obj.position = 'absolute';
        obj.width = this.width;
        obj.height = this.height;
        obj.borderRadius = this.borderRadius;
        obj.barColor = this.barColor;
        obj.transform = `rotate(${deg}deg) translate(${this.fadebarRadius}, 0px)`;
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
        const parentRect = this.$parent.$el.getBoundingClientRect();
        const bodyRect = this.$refs.contents.getBoundingClientRect();

        this.$el.style.top = `${(parentRect.height / 2) - (bodyRect.height / 2)}px`;
        this.$el.style.left = `${(parentRect.width / 2) - (bodyRect.width / 2)}px`;
        this.$el.style.width = `${bodyRect}px`;
        this.$el.style.height = `${bodyRect}px`;
      },
    },
  };
</script>

<style>
  .ev-loadingmask
  {
    position: absolute;
    z-index: 18000;
  }
  .ev-loadingmask-center
  {
    position: relative;
    top: 45%;
    left: calc(50% - 15px);
    transform: translate3d(0px, 0px, 0px);
  }
  @keyframes ev-loadingmask-fadedelay
  {
    80%
    {
      -webkit-opacity: 0.2;
      opacity: 0.2;
    }
    100%
    {
      -webkit-opacity: 0.9;
      opacity: 0.9;
    }
  }
</style>
