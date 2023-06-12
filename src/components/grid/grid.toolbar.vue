<template>
  <div class="gridToolbar">
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
  height: 30px;
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
.gridToolbar > .column-setting__icon {
  float: right;
  margin: 0 5px;
  cursor: pointer;
  &:hover {
    opacity: 0.6;
  }
}
</style>
