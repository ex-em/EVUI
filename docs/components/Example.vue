<template>
  <section>
    <h2>{{ title }}</h2>
    <p class="example-desc">
      {{ description }}
    </p>
    <div>
      123
    </div>
    <hr class="example-splitter">
  </section>
</template>

<script>
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
  },
  methods: {
  },
};
</script>

<style scoped>
</style>
