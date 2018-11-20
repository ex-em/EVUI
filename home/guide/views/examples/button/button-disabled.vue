<template>
  <div class="btn-disabled">
    <ev-button
      :type="'primary'"
      :disabled="true"
    >
      disabled
    </ev-button>
  </div>
</template>

<script>
  export default {};
</script>

<style>
  .btn-disabled{
    display: inline-block;
    margin: 5px;
    height: 40px;
  }
</style>
