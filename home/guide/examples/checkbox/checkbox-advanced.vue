<template>
  <div>
    <checkbox
      v-model="checked"
      :label="label"
      @onChange="changeValue"
    />
    <p>testtest</p>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';

  export default {
    components: {
      checkbox,
    },
    data() {
      return {
        checked: false,
        label: ' fire custom event',
        testString: 'reverse Data',
      };
    },
    methods: {
      changeValue: function changeValue() {
        this.testString = this.testString.reverse().join('').replace(/\s/gi, '');
      },
    },
  };
</script>
<style scoped>
  h4 {
    color: mediumseagreen;
  }
  h5 {
    color: darkorange;
  }
</style>
