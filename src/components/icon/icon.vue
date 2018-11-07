<template>
  <i :class="preCls"/>
</template>
<script>
  import '@/styles/all.css';
  import '@/styles/icon.css';

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
    data() {
      return {
        preCls: `${prefixCls} ${this.cls}`,
      };
    },
  };
</script>
