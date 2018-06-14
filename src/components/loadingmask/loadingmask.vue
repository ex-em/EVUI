<template>
  <div
    v-show="true"
    class="spinner"
  >
    <div
      class="spinnerCenter"
    />
  </div>
</template>

<script>
  import utils from '@/common/utils';

  export default {
    props: {
      id: {
        type: String,
        default() {
          return utils.getId();
        },
      },
      name: {
        type: String,
        default: null,
      },
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
      };
    },
    mounted() {
      this.createFadebar();
    },
    methods: {
      createFadebar() {
        let ix;
        let ixLen;
        let divBar;
        let rotatedDeg;
        let animDelay;
        const center = this.$el.childNodes[0];
        for (ix = 0, ixLen = this.barCount; ix < ixLen; ix++) {
          divBar = document.createElement('div');
          divBar.style.position = 'absolute';
          divBar.style.width = this.width;
          divBar.style.height = this.height;
          divBar.style.borderRadius = this.borderRadius;
          divBar.style.background = this.barColor;
          rotatedDeg = Math.round(360 * (+ix / ixLen));
          divBar.style.transform = `rotate(${rotatedDeg}deg) translate(${this.fadebarRadius}, 0px)`;
          divBar.style.animation = `fadeDelay ${this.animInterval}s infinite ease-in-out`;
          animDelay = (this.animInterval * (+ix / ixLen)).toFixed(3);
          divBar.style.animationDelay = `${animDelay}s`;
          center.appendChild(divBar);
        }
      },
    },
  };
</script>

<style>
  .spinner
  {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 18000;
  }
  .spinnerCenter
  {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate3d(0px, 0px, 0px);
  }
  @keyframes fadeDelay
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
