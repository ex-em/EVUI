<template>
  <div style="width:100%; height: 300px;">
    <ev-grid
      v-resize="onResize"
      ref="grid"
      :columns="columns"
      :rows="tableData"
      :selected.sync="selected"
      :checked.sync="checked"
      :option="{
        adjust: true,
        rowHeight: 30,
        columnWidth: 150,
        useCheckbox: {
          use: true,
          headerCheck: true,
          mode: 'multi'
        }
      }"
    />
  </div>
</template>
<script>
  import resize from 'vue-resize-directive';

  const contries = [
    'Russia', 'Canada', 'United States', 'China', 'Brazil',
    'Australia', 'India', 'Argentina', 'Kazakhstan', 'Algeria',
    'Denmark', 'Mexico', 'Indonesia', 'Sudan', 'Libya',
    'Iran', 'Japan', 'Korea', 'Egypt', 'Ethiopia',
  ];
  export default {
    name: 'New',
    directives: {
      resize,
    },
    data() {
      return {
        selected: [],
        checked: [],
        columns: [
          { caption: 'ID', field: 'id', type: 'number' },
          { caption: 'Country', field: 'country', type: 'string' },
          { caption: 'Area', field: 'area', type: 'number', hide: true },
          { caption: 'Population', field: 'population', type: 'number' },
          { caption: 'GDP', field: 'gdp', type: 'number' },
          { caption: 'test1', field: 'test1', type: 'number' },
          { caption: 'test2', field: 'test2', type: 'number' },
          { caption: 'test3', field: 'test3', type: 'number' },
          { caption: 'test4', field: 'test4', type: 'number' },
          { caption: 'test5', field: 'test5', type: 'number' },
          { caption: 'test6', field: 'test6', type: 'number' },
          { caption: 'test7', field: 'test7', type: 'number' },
          { caption: 'test8', field: 'test8', type: 'number' },
          // { caption: 'test9', field: 'test9' },
          // { caption: 'test10', field: 'test10' },
          // { caption: 'test11', field: 'test11' },
          // { caption: 'test12', field: 'test12' },
          // { caption: 'test13', field: 'test13' },
          // { caption: 'test14', field: 'test14' },
          // { caption: 'test15', field: 'test15' },
          // { caption: 'test16', field: 'test16' },
        ],
        tableData: [],
      };
    },
    created() {
      this.getData(100, 0);
    },
    mounted() {
      // this.getData(100, 100);
      // setTimeout(this.refreshData.bind(this), 3000);
    },
    methods: {
      onResize() {
        this.$refs.grid.$forceUpdate();
      },
      refreshData() {
        this.getData(100, this.tableData.length);
        setTimeout(this.refreshData.bind(this), 1000);
      },
      getData(count, startIndex) {
        for (let ix = startIndex; ix < startIndex + count; ix++) {
          this.tableData.push([
            ix + 1,
            contries[ix % 20],
            Math.random() * 10000,
            Math.random() * 100,
            Math.random() * 1000,
            Math.random() * 2000,
            Math.random() * 3000,
            Math.random() * 4000,
            Math.random() * 5000,
            Math.random() * 6000,
            Math.random() * 7000,
            Math.random() * 8000,
            Math.random() * 9000,
            // Math.random() * 100,
            // Math.random() * 200,
            // Math.random() * 300,
            // Math.random() * 400,
            // Math.random() * 500,
            // Math.random() * 600,
            // Math.random() * 700,
            // Math.random() * 800,
          ]);
        }
      },
    },
  };
</script>
