<template>
  <section>
    <h2>{{ title }}</h2>
    <br>
    <p class="example-desc">
      {{ description }}
    </p>
    <br><br>
    <component
      :is="contents"
    />
    <br>
    url : {{ url }}
    <br>
    <hr class="example-splitter">
  </section>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'Example',
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
  setup(props) {
    const codeData = ref('');

    console.log(`props.url : ${props.url}`);
    axios.get(props.url).then((result) => {
      codeData.value = `\`\`\`html\n${result.data}\n\`\`\``;
    });

    return {
      codeData,
    };
  },
};
</script>

<style scoped>
</style>
