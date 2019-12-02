<template>
  <div>
    <ev-button
      :type="'primary'"
      :size="'medium'"
      @click="onClick"
    >
      success
    </ev-button>
    <ev-button
      :type="'primary'"
      :size="'medium'"
      @click="onClick2"
    >
      warning
    </ev-button>
    <ev-button
      :type="'primary'"
      :size="'medium'"
      @click="onClick3"
    >
      error
    </ev-button>
    <ev-button
      :type="'primary'"
      :size="'medium'"
      @click="onClick4"
    >
      info
    </ev-button>
  </div>
</template>
<script>
  // import Message from '@/components/message/message';

  export default {
    components: {
    },
    data() {
      return {
      };
    },
    computed: {
    },
    methods: {
      onClick() {
        this.$message({
          message: 'success',
          type: 'success',
        });
      },
      onClick2() {
        this.$message({
          message: 'warning',
          type: 'warning',
        });
      },
      onClick3() {
        this.$message({
          message: 'error',
          type: 'error',
        });
      },
      onClick4() {
        this.$message({
          message: 'info',
          type: 'info',
        });
      },
    },
  };
</script>
