<template>
  <div>
    <input
      :id="checkboxId"
      :value="checkboxValue"
      :name="checkboxName"
      :checked="isCheck"
      type="checkbox"
    >
    <label
      :for="checkboxId"
    >
      {{ checkboxValue }}
    </label>
  </div>
</template>

<script>
  export default {
    props: {
      checkboxId: {
        type: String,
        required: true,
      },
      checkboxValue: {
        type: String,
        required: true,
      },
      checkboxName: {
        type: String,
        default: '',
      },
      value: {
        type: [String, Array],
        default: null,
      },
    },
    data() {
      return {
        bindValue: this.value,
      };
    },
    computed: {
      isCheck() {
        if (this.value) {
          if (typeof this.value === 'string') {
            return this.value === this.checkboxValue;
          } else if (Array.isArray(this.value)) {
            return this.value.includes(this.checkboxValue);
          }
          return false;
        }
        return false;
      },
    },
    watch: {
    },
    mounted() {
    },
    methods: {
    },
  };
</script>
<style scoped>
  div{
    padding: 2px;
  }
</style>
