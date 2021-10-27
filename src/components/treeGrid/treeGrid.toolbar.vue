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
  overflow: hidden;
}
.treeGridToolbar > .search {
  float: right;
  margin-right: 0;
}
.treeGridToolbar > .ev-button {
  margin: 0 2px 0 2px;
}
</style>
