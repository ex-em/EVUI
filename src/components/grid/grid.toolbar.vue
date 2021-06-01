<template>
  <div class="description gridToolbar">
    <slot name="toolbarWrapper"></slot>
  </div>
</template>

<script>
export default {
  name: 'EvGridToolbar',
};
</script>

<style lang="scss">
@import '../../style/index.scss';
.gridToolbar {
  margin-bottom: 10px;
}
.gridToolbar > .search {
  float: right;
  width: auto !important;
  margin-right: 0 !important;
}
.gridToolbar > .ev-button {
  margin: 0 2px 0 2px;
}
</style>
