<template>
  <div style="width:100%">
    <Table
      :width="'40%'"
      :height="'350px'"
    />
  </div>
</template>

<script>
  import Table from '@/components/table';
  // import '@/components/table/table.css';

  export default {
    components: {
      Table,
    },
  };
</script>
