<template>
  <input
    type="text"
    v-model="inputValue"  :id ="id" :name ="name" >
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
        default: "A",
      },
      value: {
        type: String,
        default:  null ,
      }
    },
    computed: {},
    methods: {},
    data() {
      return {
        inputValue: this.value+ this._uid
      };
    }
  }
</script>
<style>
</style>
