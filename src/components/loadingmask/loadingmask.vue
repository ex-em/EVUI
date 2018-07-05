<template>
  <div
    class="evui-loadingmask"
  >
    <div
      v-show="barCount"
      class="evui-loadingmask-center"
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
    },
    data() {
      return {
        barData: [],
      };
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
        obj.animation = `evui-loadingmask-fadedelay ${this.animInterval}s infinite ease-in-out`;
        obj.animDelay = `${(this.animInterval * (ix / ixLen)).toFixed(3)}s`;
        this.barData.push(obj);
      }
    },
    mounted() {
    },
    methods: {
    },
  };
</script>

<style>
  .evui-loadingmask
  {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #172027;
    z-index: 18000;
  }
  .evui-loadingmask-center
  {
    position: relative;
    top: 45%;
    left: calc(50% - 15px);
    transform: translate3d(0px, 0px, 0px);
  }
  @keyframes evui-loadingmask-fadedelay
  {
    80%
    {
      -webkit-opacity: 0.1;
      opacity: 0.1;
    }
    100%
    {
      -webkit-opacity: 0.5;
      opacity: 0.5;
    }
  }
</style>
