<template>
  <i
    :class="preCls"
    @click="click"
    @dblclick="dblClick"
    @contextmenu="contextMenu"
  />
</template>
<script>
  import '@/styles/lib/icon.css';

  const prefixCls = 'ei';

  export default {
    name: 'EvIcon',
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
    methods: {
      click(e) {
        this.$emit('click', e);
      },
      dblClick(e) {
        this.$emit('dblclick', e);
      },
      contextMenu(e) {
        this.$emit('contextmenu', e);
      },
    },
  };
</script>
