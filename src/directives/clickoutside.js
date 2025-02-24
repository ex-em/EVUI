const clickOutsideKey = Symbol('vueClickOutside');

const clickoutside = {
  mounted(el, binding) {
    const componentEl = el;
    const bubble = binding.modifiers.bubbles;
    const handler = (e) => {
      if (bubble || (componentEl !== e.target && !componentEl.contains(e.target))) {
        binding.value(e);
      }
    };

    if (!componentEl[clickOutsideKey]) {
      componentEl[clickOutsideKey] = new Map();
    }
    componentEl[clickOutsideKey].set(binding.instance, handler);
    document.addEventListener('mousedown', handler);
  },
  unmounted(el, binding) {
    const componentEl = el;

    if (componentEl[clickOutsideKey]) {
      const handler = componentEl[clickOutsideKey].get(binding.instance);
      if (handler) {
        document.removeEventListener('mousedown', handler);
        componentEl[clickOutsideKey].delete(binding.instance);
      }

      if (componentEl[clickOutsideKey].size === 0) {
        delete componentEl[clickOutsideKey];
      }
    }
  },
};

const selectClickoutside = {
  mounted(el, binding) {
    const componentEl = el;
    let dropLi = null;
    const bubble = binding.modifiers.bubble;
    const selectDropbox = document.body.getElementsByClassName('ev-select-dropbox');
    const TAG_NAME_CLS = 'ev-tag-name';
    const TAG_SUFFIX_CLOSE_CLS = 'ev-tag-suffix-close';
    const handler = (e) => {
      if (
        e.target.classList.contains(TAG_NAME_CLS) ||
        e.target.classList.contains(TAG_SUFFIX_CLOSE_CLS)
      ) {
        return;
      }
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
    if (!componentEl[clickOutsideKey]) {
      componentEl[clickOutsideKey] = new Map();
    }
    componentEl[clickOutsideKey].set(binding.instance, handler);
    document.addEventListener('mousedown', handler);
  },
  unmounted(el, binding) {
    const componentEl = el;
    if (componentEl[clickOutsideKey]) {
      const handler = componentEl[clickOutsideKey].get(binding.instance);
      if (handler) {
        document.removeEventListener('mousedown', handler);
        componentEl[clickOutsideKey].delete(binding.instance);
      }

      if (componentEl[clickOutsideKey].size === 0) {
        delete componentEl[clickOutsideKey];
      }
    }
  },
};

const datePickerClickoutside = {
  mounted(el, binding) {
    const componentEl = el;
    const bubble = binding.modifiers.bubbles;
    const selectDropbox = document.body.getElementsByClassName('ev-date-picker-dropdown');
    const handler = (e) => {
      if (
        !selectDropbox &&
        (bubble || (componentEl !== e.target && !componentEl.contains(e.target)))
      ) {
        binding.value(e);
      } else if (
        selectDropbox &&
        selectDropbox[0] &&
        selectDropbox[0] !== e.target &&
        !selectDropbox[0].contains(e.target) &&
        componentEl !== e.target &&
        !componentEl.contains(e.target)
      ) {
        binding.value(e);
      }
    };
    if (!componentEl[clickOutsideKey]) {
      componentEl[clickOutsideKey] = new Map();
    }
    componentEl[clickOutsideKey].set(binding.instance, handler);
    document.addEventListener('mousedown', handler);
  },
  unmounted(el, binding) {
    const componentEl = el;

    if (componentEl[clickOutsideKey]) {
      const handler = componentEl[clickOutsideKey].get(binding.instance);
      if (handler) {
        document.removeEventListener('mousedown', handler);
        componentEl[clickOutsideKey].delete(binding.instance);
      }

      if (componentEl[clickOutsideKey].size === 0) {
        delete componentEl[clickOutsideKey];
      }
    }
  },
};

export { clickoutside, selectClickoutside, datePickerClickoutside };
