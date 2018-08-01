<template>
  <div>
    <div>
      <h3> 닷킹 컴포넌트</h3>
      <br>
      <button @click="addDockWindow">New Window</button>
      <button @click="saveLayout">Save</button>
      <button @click="clearLayout">Clear</button>
    </div>
    <ev-docking
      ref="dockContainer"
      :docking-list="getLayout"
      :bounds="containerBounds"
    />
  </div>
</template>
<style>
</style>
<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    data() {
      return {
        contents: [
          'SimpleLine',
          'FillLine',
          'StackedLine',
          'SimpleBar',
          'StackedBar',
          'HorizontalBar',
        ],
        containerBounds: {
          top: 140,
          left: 40,
          width: 1840,
          height: 900,
        },
      };
    },
    computed: {
      ...mapGetters({
        getNodes: 'nodes/getAllItems',
        getMaps: 'nodes/getAllMapItems',
        getSplits: 'splitters/getAllItems',
        getMaxIdSeq: 'windows/getMaxIdSeq',
      }),
      getLayout() {
        return JSON.parse(localStorage.getItem('layout-1') || '{}');
      },
    },
    methods: {
      ...mapActions({
        addWindow: 'windows/addWindow',
      }),
      addDockWindow() {
        const bounds = this.$refs.dockContainer.$el.getBoundingClientRect();
        const dockWindow = {
          id: `window-${this.getMaxIdSeq() + 1}`,
          top: bounds.top + ((bounds.height / 2) - 200),
          left: bounds.left + ((bounds.width / 2) - 250),
          width: 500,
          height: 400,
          contents: this.contents[Math.floor(Math.random() * 10)],
          rs: null,
        };

        this.addWindow(dockWindow);
      },
      saveLayout() {
        const layout = {
          nodes: this.getNodes(),
          nodeMap: this.getMaps(),
          splitters: this.getSplits(),
        };

        localStorage.setItem('layout-1', JSON.stringify(layout));
      },
      clearLayout() {
        localStorage.removeItem('layout-1');
        location.reload();
      },
    },
  };
</script>
