<template>
  <div
    style="width:100%; height: 100%; padding-top: 70px; padding-bottom: 10px;"
  >
    <div
      style="top: 50px; height: 55px; position: absolute;"
    >
      <h3> 닷킹 컴포넌트</h3>
      <div
        class="menu-list-wrap"
      >
        <ev-selectbox
          :name="'Menu'"
          :items="menuList"
          class="menu-list"
          @select="onSelect"
        />
        <ev-button
          :name="'Save'"
          :text="'Save'"
          style="width: 50px; height: 30px"
          @click="onSave"
        />
        <ev-button
          :name="'Clear'"
          :text="'Clear'"
          style="width: 50px; height: 30px"
          @click="onClear"
        />
      </div>
    </div>
    <ev-docking
      ref="dockContainer"
      :docking-tree="getLayout"
    />
  </div>
</template>
<script>
  export default {
    data() {
      return {
        menuList: [{
          name: 'SimpleLineChart',
        }, {
          name: 'FillLineChart',
        }, {
          name: 'StackedLineChart',
        }, {
          name: 'SimpleBarChart',
        }, {
          name: 'StackedBarChart',
        }],
        contents: [
          'SimpleLineChart',
          'FillLineChart',
          'StackedLineChart',
          'SimpleBarChart',
          'StackedBarChart',
          'HorizontalBarChart',
        ],
      };
    },
    computed: {
      getLayout() {
        return JSON.parse(localStorage.getItem('layout-1') || '{}');
      },
    },
    methods: {
      onSelect(item) {
        this.$refs.dockContainer.addWindow(item.name);
      },
      onSave() {
        const layout = this.$refs.dockContainer.getLayout();

        localStorage.setItem('layout-1', JSON.stringify(layout));
      },
      onClear() {
        localStorage.removeItem('layout-1');
        location.reload();
      },
    },
  };
</script>
<style>
  .menu-list-wrap {
    display: flex;
    height: 30px;
    margin-right: 5px;
  }
  .menu-list {
    width: 150px;
    height: 100%;
    margin-right: 5px;
  }
</style>
