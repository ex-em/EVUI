<template>
  <div
    style="padding: 30px 0 0 30px;"
  >
    <div
      class="base"
    >
      <ev-loading-mask
        v-if="isShow"
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
  export default {
    components: {
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
