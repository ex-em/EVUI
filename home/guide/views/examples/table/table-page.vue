<template>
  <div style="width:100%">
    <ev-table
      ref="test"
      :width="'1000px'"
      :height="'350px'"
      :pagination="true"
      :filter="true"
      :columns="columns"
      :records="rowData"
    />
  </div>
</template>

<script>
  export default {
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
        rowData: null,
      };
    },
    created() {
      this.rowData = this.$tableData;
    },
  };
</script>
