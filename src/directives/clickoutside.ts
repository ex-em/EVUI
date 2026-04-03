import type { Directive, DirectiveBinding } from 'vue';

interface ClickOutsideHTMLElement extends HTMLElement {
  vueClickOutside: ((e: MouseEvent) => void) | null;
}

const clickoutside: Directive = {
  mounted(el: ClickOutsideHTMLElement, binding: DirectiveBinding<(e: MouseEvent) => void>) {
    const componentEl = el;
    const bubble = binding.modifiers.bubbles;
    const handler = (e: MouseEvent) => {
      if (bubble || (componentEl !== e.target && !componentEl.contains(e.target as Node))) {
        binding.value(e);
      }
    };
    componentEl.vueClickOutside = handler;
    document.addEventListener('mousedown', handler);
  },
  unmounted(el: ClickOutsideHTMLElement) {
    const componentEl = el;
    document.removeEventListener('mousedown', componentEl.vueClickOutside!);
    componentEl.vueClickOutside = null;
  },
};

const selectClickoutside: Directive = {
  mounted(el: ClickOutsideHTMLElement, binding: DirectiveBinding<(e: MouseEvent) => void>) {
    const componentEl = el;
    let dropLi: Element | null = null;
    const bubble = binding.modifiers.bubble;
    const selectDropbox = document.body.getElementsByClassName('ev-select-dropbox');
    const TAG_NAME_CLS = 'ev-tag-name';
    const TAG_SUFFIX_CLOSE_CLS = 'ev-tag-suffix-close';
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains(TAG_NAME_CLS) ||
        target.classList.contains(TAG_SUFFIX_CLOSE_CLS)
      ) {
        return;
      }
      if (selectDropbox && selectDropbox.length) {
        if (bubble || (componentEl !== target && !componentEl.contains(target))) {
          for (let i = 0; i < selectDropbox.length; i++) {
            dropLi = selectDropbox[i];
            if (dropLi !== target && !dropLi.contains(target)) {
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
  unmounted(el: ClickOutsideHTMLElement) {
    const componentEl = el;
    document.removeEventListener('mousedown', componentEl.vueClickOutside!);
    componentEl.vueClickOutside = null;
  },
};

const datePickerClickoutside: Directive = {
  mounted(el: ClickOutsideHTMLElement, binding: DirectiveBinding<(e: MouseEvent) => void>) {
    const componentEl = el;
    const bubble = binding.modifiers.bubbles;
    const selectDropbox = document.body.getElementsByClassName('ev-date-picker-dropdown');
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !selectDropbox &&
        (bubble || (componentEl !== target && !componentEl.contains(target)))
      ) {
        binding.value(e);
      } else if (
        selectDropbox &&
        selectDropbox[0] &&
        selectDropbox[0] !== target &&
        !selectDropbox[0].contains(target) &&
        componentEl !== target &&
        !componentEl.contains(target)
      ) {
        binding.value(e);
      }
    };
    componentEl.vueClickOutside = handler;
    document.addEventListener('mousedown', handler);
  },
  unmounted(el: ClickOutsideHTMLElement) {
    const componentEl = el;
    document.removeEventListener('mousedown', componentEl.vueClickOutside!);
    componentEl.vueClickOutside = null;
  },
};

export { clickoutside, selectClickoutside, datePickerClickoutside };
