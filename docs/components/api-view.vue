<template>
  <div>
    <h2>API</h2>
    <br>
    <ev-markdown
      :source="textData"
    />
  </div>
</template>
<script>
  import axios from 'axios';

  export default {
    name: 'ApiView',
    props: {
      url: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        textData: '',
      };
    },
    async created() {
      await axios.get(this.url)
        .then((result) => {
          this.textData = result.data;
        }, (error) => {
          throw new Error(error);
        });
    },
  };
</script>
<style>
</style>
