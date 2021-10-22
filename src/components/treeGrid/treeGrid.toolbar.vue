<template>
  <div class="description treeGridToolbar">
    <slot name="toolbarWrapper"></slot>
  </div>
</template>

<script>
export default {
  name: 'EvTreeGridToolbar',
};
</script>

<style lang="scss">
@import '../../style/index.scss';
.treeGridToolbar {
  margin-bottom: 10px;
}
.treeGridToolbar > .search {
  float: right;
  width: auto !important;
  margin-right: 0 !important;
}
.treeGridToolbar > .ev-button {
  margin: 0 2px 0 2px;
}
</style>
