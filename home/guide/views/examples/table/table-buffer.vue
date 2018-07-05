<template>
  <div style="width:100%">
    <evui-table
      ref="test"
      :width="'1000px'"
      :height="'350px'"
      :virtual-scroll="true"
      :columns="columns"
      :records="rowData"
    />
  </div>
</template>

<script>
  import EvuiTable from '@/components/table';
  import rowdata from '@/components/table/data.json';

  export default {
    components: {
      EvuiTable,
    },
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
  };
</script>
