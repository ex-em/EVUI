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
        this.$notify({
          title: 'top-right',
          message: 'success',
          type: 'success',
          position: 'top-right',
        });
      },
      onClick2() {
        this.$notify({
          title: 'bottom-right',
          message: 'warning',
          type: 'warning',
          position: 'bottom-right',
        });
      },
      onClick3() {
        this.$notify({
          title: 'bottom-left',
          message: 'error',
          type: 'error',
          position: 'bottom-left',
        });
      },
      onClick4() {
        this.$notify({
          title: 'top-left',
          message: 'info',
          type: 'info',
          position: 'top-left',
        });
      },
    },
  };
</script>
