<template>
  <div
    :id="id"
    class="resizebar"
  />
</template>

<script>
  export default {


    props: {
      id: {
        type: String,
        default() {
          return `evui-${this._uid}`;
        },
      },
      layout: {
        type: String,
        default: null,
      }
      ,
    },

    data() {
      return {

      };
    },

    computed: {
    },
    mounted() {
    },
    created() {

    },
    methods: {
    },
  };
</script>
;
