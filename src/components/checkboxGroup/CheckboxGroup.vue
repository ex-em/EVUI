<template>
  <div>EvCheckboxGroup</div>
</template>

<script>
export default {
  name: 'EvCheckboxGroup',
  props: {
  },
  setup() {
  },
};
</script>

<style lang="scss">
.ev-checkbox {
  cursor: pointer;
  input {
    cursor: pointer;
  }

  &.disabled {
    color: #C0C4CC;
    cursor: not-allowed;
    input {
      cursor: not-allowed;
    }
  }
}
</style>
