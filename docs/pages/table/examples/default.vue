<template>
  <div style="width:100%">
    <input
      v-model="t"
      type="text"
    >
    <input
      type="button"
      value="ttt"
      @click="tt"
    >
    <ev-table
      ref="test"
      :width="'1000px'"
      :height="'350px'"
      :filter="true"
      :select="'single'"
      :columns="columns"
      :records="rowData"
    />
    <button @click="getSelectedData">test</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        t: '',
        columns: [
          { field: 'recid', caption: 'ID', size: '50px', sortable: true },
          { field: 'fname', caption: 'First Name', size: '169px', sortable: true },
          { field: 'lname', caption: 'Last Name', size: '168px', sortable: true },
          { field: 'email', caption: 'Email', size: '104px' },
          { field: 'sdate', caption: 'Start Date' },
        ],
        rowData: [
          { recid: 1, fname: 'John', lname: 'doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 2, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 3, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 4, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 5, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 6, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 7, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 8, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 9, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 10, fname: 'Jill', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 11, fname: 'Frank', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 12, fname: 'Peter', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 13, fname: 'Andrew', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 200, fname: 'Manny', lname: 'Zilver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 14, fname: 'Manny', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
          { recid: 15, fname: 'Ben', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
        ],
        testData: [
          {
            children: [
              {
                children: [{
                  children: [],
                  leaf: false,
                  level: 1,
                  name: 'Sub-Value',
                  niif_account: '36565',
                  parent_id: 2,
                  id: 4,
                  description: 'sub-description',
                }],
                leaf: true,
                level: 1,
                niff_account: '123567',
                id: 2,
                data: {
                  description: 'sub-description value 1',
                  parent_id: 1,
                  name: 'Sub-Value 1',
                },
              },
            ],
            leaf: false,
            level: 0,
            parent_id: null,
            expend: null,
            id: 1,
            data: {
              description: 'description value 1',
              niff_account: '',
              name: 'Value 1',
            },
          },
          {
            children: [],
            leaf: true,
            level: 0,
            parent_id: null,
            expend: null,
            id: 2,
            data: {
              description: 'description value 2',
              niff_account: '',
              name: 'Value 2',
            },
          },
        ],
      };
    },
    created() {
      // const test = tr.testData;
      // const test1 = tr.transformTreeToArray(test);
      // window.console.log(test1);
    },
    methods: {
      tt() {
        // debugger;
        this.$refs.test.findData('fname', this.t);
        // this.$refs.test.setData(this.$tableData);
        // this.$refs.test.draw();
      },
      getSelectedData() {
        console.log('selected Data', this.$refs.test.getSelectedData());
      },
    },
  };
</script>
