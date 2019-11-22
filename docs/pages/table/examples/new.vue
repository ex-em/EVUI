<template>
  <div style="width:100%; height: 300px;">
    <ev-grid
      :columns="columns"
      :rows="tableData"
      :selected.sync="selected"
      :checked.sync="checked"
      :option="{
        adjust: true,
        rowHeight: 30,
        columnWidth: 100,
        useSelected: true,
        useCheckbox: {
          use: true,
          headerCheck: true,
          mode: 'multi'
        }
      }"
    >
      <template v-slot:test1="item">
        <ev-checkbox
          v-model="item.row[item.cellIndex]"
          :type="'square'"
          @on-click="onCheckBox"
          @click.native.stop=""
        />
      </template>
      <template v-slot:test2="item">
        <ev-toggle
          v-model="item.row[item.cellIndex]"
          @click.native.stop=""
        />
      </template>
      <template v-slot:test3="item">
        <ev-radio-group
          v-model="item.row[item.cellIndex]"
        >
          <ev-radio
            v-for="(value, name) in item.props.children"
            :key="value"
            :value="value"
            @click.native.stop=""
          >
            {{ name }}
          </ev-radio>
        </ev-radio-group>
      </template>
      <template v-slot:test4="item">
        <ev-button
          :type="'primary'"
          :size="'small'"
          @on-click="onButton"
          @click.native.stop=""
        >
          Test Button
        </ev-button>
      </template>
      <template v-slot:test5="item">
        <ev-text-field
          v-model="item.row[item.cellIndex]"
          :placeholder="'Do Something ...'"
          @click.native.stop=""
        />
      </template>
      <template v-slot:test6="item">
        <ev-input
          v-model="item.row[item.cellIndex]"
          @click.native.stop=""
        />
      </template>
      <template v-slot:test7="item">
        <ev-selectbox
          v-model="item.row[item.cellIndex]"
          :items="item.props.list"
          @click.native.stop=""
        />
      </template>
      <template v-slot:test8="item">
        <ev-selectbox
          v-model="item.row[item.cellIndex]"
          :items="item.props.list"
          :multiple="true"
          @click.native.stop=""
        />
      </template>
    </ev-grid>
  </div>
</template>
<script>
  const countries = [
    'Russia', 'Canada', 'United States', 'China', 'Brazil',
    'Australia', 'India', 'Argentina', 'Kazakhstan', 'Algeria',
    'Denmark', 'Mexico', 'Indonesia', 'Sudan', 'Libya',
    'Iran', 'Japan', 'Korea', 'Egypt', 'Ethiopia',
  ];
  export default {
    name: 'New',
    data() {
      return {
        selected: [],
        checked: [],
        columns: [
          { caption: 'ID', field: 'id', type: 'number', width: 50 },
          { caption: 'Country', field: 'country', type: 'string' },
          { caption: 'Area', field: 'area', type: 'number', hide: true },
          { caption: 'Population', field: 'population', type: 'number' },
          { caption: 'GDP', field: 'gdp', type: 'number' },
          // { caption: 'test1', field: 'test1', type: 'boolean',
          // width: 50, render: { use: true } },
          // { caption: 'test2', field: 'test2', type: 'boolean', render: { use: true } },
          // {
          //   caption: 'test3',
          //   field: 'test3',
          //   type: 'string',
          //   width: 300,
          //   render: {
          //     use: true,
          //     props: {
          //       children: {
          //         typeA: 'radio-01',
          //         typeB: 'radio-02',
          //         typeC: 'radio-03',
          //       },
          //     },
          //   },
          // },
          // { caption: 'test4', field: 'test4', type: 'string', render: { use: true } },
          // { caption: 'test5', field: 'test5', type: 'string', render: { use: true } },
          // { caption: 'test6', field: 'test6', type: 'number', render: { use: true } },
          // {
          //   caption: 'test7',
          //   field: 'test7',
          //   type: 'string',
          //   width: 100,
          //   render: {
          //     use: true,
          //     props: {
          //       list: [
          //         { name: 'normal', value: 'normal' },
          //         { name: 'warning', value: 'warning' },
          //         { name: 'critical', value: 'critical' },
          //       ],
          //     },
          //   },
          // },
          // {
          //   caption: 'test8',
          //   field: 'test8',
          //   type: 'array',
          //   width: 200,
          //   render: {
          //     use: true,
          //     props: {
          //       list: [
          //         { name: 'normal', value: 'normal' },
          //         { name: 'warning', value: 'warning' },
          //         { name: 'critical', value: 'critical' },
          //         { name: 'block', value: 'block' },
          //         { name: 'major', value: 'major' },
          //         { name: 'minor', value: 'minor' },
          //       ],
          //     },
          //   },
          // },
          // { caption: 'test9', field: 'test9', type: 'number' },
          // { caption: 'test10', field: 'test10', type: 'number' },
          // { caption: 'test11', field: 'test11', type: 'number' },
          // { caption: 'test12', field: 'test12', type: 'number' },
          // { caption: 'test13', field: 'test13', type: 'number' },
          // { caption: 'test14', field: 'test14', type: 'number' },
          // { caption: 'test15', field: 'test15' },
          // { caption: 'test16', field: 'test16' },
        ],
        tableData: [],
      };
    },
    watch: {},
    created() {
      this.getData(11, 0);
    },
    mounted() {
      // this.getData(100, 100);
      // setTimeout(this.refreshData.bind(this), 3000);
    },
    methods: {
      onButton() {
      },
      onCheckBox() {
      },
      refreshData() {
        this.getData(100, this.tableData.length);
        setTimeout(this.refreshData.bind(this), 1000);
      },
      getData(count, startIndex) {
        for (let ix = startIndex; ix < startIndex + count; ix++) {
          this.tableData.push([
            ix + 1,
            countries[ix % 20],
            Math.random() * 10000,
            Math.random() * 100,
            Math.random() * 1000,
            // false,
            // false,
            // 'radio-01',
            // null,
            // '',
            // 1,
            // 'normal',
            // ['warning', 'block'],
            // Math.random() * 2000,
            // Math.random() * 3000,
            // Math.random() * 4000,
            // Math.random() * 5000,
            // Math.random() * 6000,
            // Math.random() * 7000,
            // Math.random() * 8000,
            // Math.random() * 9000,
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
