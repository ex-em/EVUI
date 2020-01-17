<template>
  <i :class="preCls"/>
</template>
<script>
  import '@/styles/lib/icon.css';

  const prefixCls = 'ei';

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
      cls: {
        type: String,
        default: null,
      },
    },
    computed: {
      preCls() {
        return `${prefixCls} ${this.cls}`;
      },
    },
  };
</script>
