<template>
  <div>
    <div style="width: 400px; height: 200px;">
      <loadingmask
      />
    </div>
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import loadingmask from '@/components/loadingmask/loadingmask';

  export default {
    components: {
      loadingmask,
    },
    data() {
      return {
      };
    },
    methods: {
    },
  };
</script>
