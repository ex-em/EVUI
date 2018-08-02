<template>
  <div style="width:100%">
    <ev-table
      ref="test"
      :width="'50%'"
      :height="'350px'"
      :virtual-scroll="true"
      :columns="columns"
      :records="rowData"
    />
    <button @click="add">add row</button>
  </div>
</template>

<script>
  import rowdata from '@/components/table/data.json';
  // import rowdata2 from '@/components/table/data2.json';
  // import '@/components/table/table.css';

  export default {
    data() {
      return {
        columns: [
          { field: 'recid', caption: 'ID', size: '50px', sortable: true },
          { field: 'fname', caption: 'First Name', size: '23%', sortable: true },
          // { field: 'lname', caption: 'Last Name', size: '30%', sortable: true },
          // { field: 'email', caption: 'Email', size: '40%' },
          // { field: 'fname', caption: 'First Name', size: '169px', sortable: true },
          { field: 'lname', caption: 'Last Name', size: '168px', sortable: true },
          { field: 'email', caption: 'Email' },
          { field: 'sdate', caption: 'Start Date' },
          { field: 'edate', caption: 'End Date' },
        ],
        rowData: rowdata,
      };
    },
    methods: {
      add() {
        this.$refs.test.addRow({}, 'start');
      },
    },
  };
</script>
