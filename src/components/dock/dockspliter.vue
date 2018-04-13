<template>
  <div
    :data-ref="dataRef"
    class="resizebar"
  />
</template>

<script>
  export default {


    props: {
      dataRef: {
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
