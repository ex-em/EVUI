export const resize = {
  mounted(el, binding) {
    const handler = binding.value;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      handler({ width, height });
    });

    observer.observe(el);
    el.__resizeObserver__ = observer;
  },

  unmounted(el) {
    el.__resizeObserver__?.disconnect();
    el.__resizeObserver__ = null;
  },
};
