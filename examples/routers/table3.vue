<template>
  <div style="width:100%">
    <Table
      ref="test"
      :width="'100%'"
      :height="'350px'"
      :columns="columns"
      :records="rowData2"
    />
    <button @click="add">add row</button>
  </div>
</template>

<script>
  import Table from '@/components/table';
  import rowdata2 from '@/components/table/data.json';
  // import '@/components/table/table.css';

  export default {
    components: {
      Table,
    },
    data() {
      return {
        columns: [
          { field: 'recid', caption: 'ID', size: '50px', sortable: true },
          // { field: 'fname', caption: 'First Name', size: '30%', sortable: true },
          // { field: 'lname', caption: 'Last Name', size: '30%', sortable: true },
          // { field: 'email', caption: 'Email', size: '40%' },
          { field: 'fname', caption: 'First Name', size: '169px', sortable: true },
          { field: 'lname', caption: 'Last Name', size: '168px', sortable: true },
          { field: 'email', caption: 'Email', size: '104px' },
          { field: 'sdate', caption: 'Start Date' },
          { field: 'edate', caption: 'End Date' },
          { field: 'edate', caption: 'End Date' },
        ],
        rowData2: rowdata2,
      };
    },
    created() {
    },
    methods: {
      add() {
        this.$refs.test.addRow({}, 'start');
      },
    },
  };
</script>
