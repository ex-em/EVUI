<template>
  <div>
    <ev-button
      type="primary"
      @click="onClick"
    >
      Open Window
    </ev-button>
    <ev-window
      :is-show.sync="isShow"
      :body-style="{ padding: '10px' }"
      title="Title"
    >
      <button-type/>
    </ev-window>
    <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>

<script>
  import ButtonType from './../button/button-type';

  export default {
    components: {
      ButtonType,
    },
    data() {
      return {
        buttonType: ButtonType,
        isShow: false,
      };
    },
    methods: {
      onClick() {
        this.isShow = !this.isShow;
      },
    },
  };
</script>

<style/>
