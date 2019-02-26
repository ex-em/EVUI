<template>
  <div
    style="padding: 30px 0 0 30px;"
  >
    <div
      class="base"
    >
      <loadingmask
        v-show="isShow"
      />
      Loading Mask Test Area
    </div>
    <br>
    <button
      @click="click"
    >
      loading {{ isShow }}
    </button>
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import loadingmask from '@/components/loadingmask/loadingmask';

  export default {
    components: {
      loadingmask,
    },
    data() {
      return {
        isShow: true,
      };
    },
    methods: {
      click() {
        this.isShow = !this.isShow;
      },
    },
  };
</script>

<style>
  .base {
    width: 400px;
    height: 200px;
    border: 5px solid #FFFF00;
    padding: 10px 20px 30px 40px;
    margin: 20px;
  }
</style>
