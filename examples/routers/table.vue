<template>
  <div style="width:100%">
    <Table
      :width="'100%'"
      :height="'350px'"
    />
  </div>
</template>

<script>
  import Table from '@/components/table';

  export default {
    components: {
      Table,
    },
  };
</script>
