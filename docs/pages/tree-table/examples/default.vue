<template>
  <div style="width:100%">
    <ev-tree-table
      ref="test"
      :width="'1000px'"
      :height="'350px'"
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
          { field: 'name', caption: 'Name', size: '200px' },
          { field: 'description', caption: 'Description', size: '400px' },
          { field: 'niif_account', caption: 'Account' },
        ],
        rowData: [
          {
            children: [
              {
                children: [
                  {
                    children: [],
                    data: {
                      name: 'Sub-Value',
                      description: 'sub-description',
                      niif_account: '36565',
                    },
                  },
                ],
                expend: true,
                data: {
                  description: 'sub-description value 1',
                  niff_account: '123567',
                  name: 'Sub-Value 1',
                },
              },
            ],
            expend: true,
            data: {
              description: 'description value 1',
              niff_account: '',
              name: 'Value 1',
            },
          },
          {
            children: [],
            expend: null,
            data: {
              description: 'description value 2',
              niff_account: '',
              name: 'Value 2',
            },
          },
        ],
      };
    },
  };
</script>
