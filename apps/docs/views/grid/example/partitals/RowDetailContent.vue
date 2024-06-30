<template>
  <div class="row-detail">
    Row Detail Info
    <br>
    {{ $props.data }}
  </div>
</template>

<script>
export default {
  name: 'RowDetail',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  setup() {
    return {};
  },
};
</script>

<style scoped lang="scss">
  .row-detail {
    display: flex;
    width: 100%;
    height: 100px;
    padding: 10px;
    align-items: center;
    background-color: rgba(250, 222, 76, 0.6);
  }
</style>
