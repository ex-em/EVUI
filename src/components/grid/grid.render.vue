<script>
  export default {
    props: {
      name: {
        type: String,
        default: '',
      },
      item: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
      };
    },
    render(h) {
      const slot = this.$parent.$scopedSlots[this.name] || this.$slots[this.name];
      const scope = this.item;

      return h(
        'div',
        {
          class: 'wrap',
        },
        slot(scope),
      );
    },
  };
</script>
<style scoped>
  .wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
