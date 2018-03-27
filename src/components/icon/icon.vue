<template>
  <i class="fa"/>
</template>
<script>
  import '@/styles/all.css';

  export default {
    props: {
      type: {
        type: String,
        default: null,
      },
      size: {
        type: [Number, String],
        default: null,
      },
    },
  };
</script>
