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
        });
      },
    },
  };
</script>
