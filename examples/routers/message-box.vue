<template>
  <div>
    <ev-button
      :type="'primary'"
      :size="'medium'"
      @click="onClick"
    >
      success
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
        this.$messagebox({
          title: 'Title',
          message: 'message',
          type: 'success',
          onClosed: (type, scope) => {
            console.log(type);
            console.log(scope);
            this.$message({
              message: type,
              type: 'success',
            });
          },
        });
      },
    },
  };
</script>
