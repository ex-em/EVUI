<template>
  <div>
    <div>time: {{ time }}</div>

    <selectbox
      :options="options"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import selectbox from '@/components/selectbox/selectbox';

  export default {
    components: {
      selectbox,
    },
    data() {
      const opt = [];
      for (let ix = 0, ixLen = 500; ix < ixLen; ix++) {
        opt[ix] = { name: `name + ${ix}`, value: ix };
      }

      return {
        visible: false,
        label: 'test',
        valueData: null,
        buttonLabel: 'visible',
        options: opt,
        start: null,
        end: null,
        time: null,
      };
    },
    created() {
      this.start = performance.now();
    },
    mounted() {
      this.end = performance.now();
      this.time = this.end - this.start;
    },
    methods: {
      onChange(value) {
        this.valueData = value;
      },
    },
  };
</script>

<style scoped>
</style>
