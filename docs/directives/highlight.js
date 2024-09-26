import hljs from 'highlight.js';

const highlight = {
  mounted(el) {
    const blocks = el.querySelectorAll('pre');
    blocks.forEach((block) => {
      hljs.highlightElement(block);
    });
  },
};

export default highlight;
