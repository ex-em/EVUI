<template>
  <div style="width:100%">
    <Table
      :width="'40%'"
      :height="'350px'"
      :pagination="true"
    />
  </div>
</template>

<script>
  import Table from '@/components/table/table';

  export default {
    components: {
      Table,
    },
  };
</script>
