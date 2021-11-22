<template>
  <div class="description tree-grid-toolbar">
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
  margin-bottom: 10px;
  overflow: hidden;
}
.tree-grid-toolbar > .search {
  float: right;
  margin-right: 0;
}
.tree-grid-toolbar > .ev-button {
  margin: 0 2px 0 2px;
}
</style>
