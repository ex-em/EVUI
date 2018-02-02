<template>
  <input
    type="text"
    v-model="inputValue"
  >
</template>

<script>
  export default {
    props: {
      id: {
        type: String,
        default: function () {
          return 'evui-' + this._uid;
        },
      },
      name: {
        type: String,
        default: null,
      },
      value: {
        default: null,
      }
    },
    computed: {},
    methods: {},
    data() {
      return {
        inputValue: this.value
      };
    }
  }
</script>
<style>
</style>
