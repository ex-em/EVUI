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
    {{ valueData }}
    <code-view>
      {{ code.text }}
    </code-view>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';
  import codeView from '@/components/codeview/code';
  import Code from '../../src/code/checkbox';

  export default {
    name: 'Checkbox',
    components: {
      checkbox,
      codeView,
    },
    data() {
      return {
        visible: true,
        label: 'test',
        valueData: null,
        buttonLabel: 'visible',
        text: 'testtest',
        code: Code,
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
</style>
