<template>
  <div>
    <ev-button
      text="Open Window"
      type="primary"
      @click="onClick"
    />
    <ev-window
      ref="win"
      :body-style="{ padding: '10px' }"
      :content="buttonType"
      title="Title"
      @resize="resize"
    />
    <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>

<script>
  import buttonType from './../button/button-type';

  export default {
    components: {
      buttonType,
    },
    data() {
      return {
        buttonType,
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
      resize() {
      },
    },
  };
</script>

<style scoped>

</style>
