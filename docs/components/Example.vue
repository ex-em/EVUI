<template>
  <section>
    <h2>{{ title }}</h2>
    <br>
    <p class="example-desc">
      {{ description }}
    </p>
    <br><br>
    <div
      class="example-sample"
    >
      <component
        :is="contents"
      />
      <hr class="example-splitter">
      <div v-highlight>
        <pre>
          {{ content }}
        </pre>
      </div>
    </div>
  </section>
</template>

<script>
import { parseComponent } from 'vue-template-compiler';
import hljs from 'highlight.js';
import CheckboxRaw from '!!raw-loader!../views/checkbox/example/Default';
import 'highlight.js/styles/github.css';

export default {
  name: 'Example',
  directives: {
    highlight: {
      mounted(el) {
        const blocks = el.querySelectorAll('pre');
        blocks.forEach((block) => {
          hljs.highlightBlock(block);
        });
      },
    },
  },
  components: {
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    contents: {
      type: Object,
      default: null,
    },
    url: {
      type: String,
      default: '',
    },
  },
  setup() {
    const { template } = parseComponent(CheckboxRaw);
    const { content } = template;

    return {
      content,
      template,
    };
  },
};
</script>

<style lang="scss">
.example-sample {
  display: flex;
  border: 1px solid #FFDD57;
  border-radius: 4px;
  div {
    max-height: 600px;
    flex-grow: 1;
    padding: 15px;
    overflow-y: auto;
  }
  div:last-child {
    padding: 0;
  }
}

.example-splitter {
  width: 1px;
  background-color: #FFDD57;
  border: none;
}
</style>
