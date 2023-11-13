<template>
  <div class="tree-grid-toolbar">
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
.tree-grid-toolbar {
  height: 30px;
  margin-bottom: 10px;
}
.tree-grid-toolbar > .search {
  float: right;
  width: auto !important;
  margin-right: 0 !important;
}
.tree-grid-toolbar > .ev-button {
  margin: 0 2px 0 2px;
}
.tree-grid-toolbar > .grid-setting__icon {
  float: right;
  margin: 10px 5px;
  cursor: pointer;
  &:hover {
    opacity: 0.6;
  }
}
</style>
