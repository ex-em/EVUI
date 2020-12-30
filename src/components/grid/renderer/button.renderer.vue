<template>
  <ev-button
      ref="button"
      :type="option.btnType"
      :shape="option.btnShape"
      size="small"
      @click="clickedHandler"
  >
    <ev-icon v-if="option.btnIcon" :icon="option.btnIcon" />
    {{ option.btnName }}
  </ev-button>
</template>
<script>
  export default {
    props: {
      item: {
        type: Object,
        default: () => ({ message: '' }),
      },
      option: {
        type: Object,
        default: () => ({ message: '' }),
      },
    },
    setup(props) {
      const clickedHandler = (e) => {
        if (props.option.onClick) {
          props.option.onClick(e);
        }
      };
      return {
        clickedHandler,
      };
    },
  };
</script>
<style lang="scss" scoped>
.ev-button {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
