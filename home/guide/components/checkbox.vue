<template>
  <div>
    <checkbox
      :label="label"
      :checked="true"
      :disabled="visible"
      :value="'test'"
      @change="onChange"
    />
    <button
      @click="visible = !visible"
    > {{ visible ? 'visible' : 'invisible' }}</button>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';

  export default {
    name: 'Checkbox',
    components: {
      checkbox,
    },
    data() {
      return {
        visible: true,
        label: 'test',
        valueData: null,
        buttonLabel: 'visible',
        text: 'testtest',
      };
    },
    methods: {
      onChange(value) {
        this.valueData = value;
      },
    },
  };
</script>

<style scoped>
  .class {
    flex-wrap: wrap;
  }
</style>
