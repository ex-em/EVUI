<template>
  <div style="width:100%">
    <Table
      ref="test"
      :width="'50%'"
      :height="'350px'"
      :pagination="true"
      :columns="columns"
      :records="rowData"
    />
    <button @click="add">add row</button>
  </div>
</template>

<script>
  import Table from '@/components/table';
  import rowdata from '@/components/table/data.json';
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
