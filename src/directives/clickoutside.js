const clickoutside = {
  mounted(el, binding) {
    const componentEl = el;
    const bubble = binding.modifiers.bubbles;
    const handler = (e) => {
      if (bubble
        || (componentEl !== e.target
          && !componentEl.contains(e.target))
      ) {
        binding.value(e);
      }
    };
    componentEl.vueClickOutside = handler;
    document.addEventListener('mousedown', handler);
  },
  unmounted(el) {
    const componentEl = el;
    document.removeEventListener('mousedown', componentEl.vueClickOutside);
    componentEl.vueClickOutside = null;
  },
};

const selectClickoutside = {
  mounted(el, binding) {
    const componentEl = el;
    let dropLi = null;
    const bubble = binding.modifiers.bubble;
    const selectDropbox = document.body.getElementsByClassName('ev-select-dropdown');
    const handler = (e) => {
      if (selectDropbox && selectDropbox.length) {
        if (bubble || (componentEl !== e.target && !componentEl.contains(e.target))) {
          for (let i = 0; i < selectDropbox.length; i++) {
            dropLi = selectDropbox[i];
            if (dropLi !== e.target && !dropLi.contains(e.target)) {
              binding.value(e);
              break;
            }
          }
        }
      }
    };
    componentEl.vueClickOutside = handler;
    document.addEventListener('mousedown', handler);
  },
  unmounted(el) {
    const componentEl = el;
    document.removeEventListener('mousedown', componentEl.vueClickOutside);
    componentEl.vueClickOutside = null;
  },
};

export {
  clickoutside,
  selectClickoutside,
};
