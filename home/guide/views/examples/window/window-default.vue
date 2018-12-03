<template>
  <div>
    <ev-button
      type="primary"
      @click="onClick"
    >
      Open Window
    </ev-button>
    <ev-window
      ref="win"
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
      };
    },
    methods: {
      onClick() {
        const win = this.$refs.win;

        if (win) {
          if (win.isShow) {
            win.hide();
          } else {
            win.show();
          }
        }
      },
    },
  };
</script>

<style/>
