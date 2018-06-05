<template>
  <div>
    <checkbox
      :label="label"
      :checked="true"
      :disabled="visible"
      :value="'test'"
    />
    <button
      @click="visible = !visible"
    > {{ visible ? 'visible' : 'invisible' }}</button>
    {{ visible }}
    <checkboxGroup
      :value="checkBoxGroup"
      @change="onChange"
    >
      <checkbox
        :label="'check01'"
        :checked="true"
      />
      <checkbox
        :label="'check02'"
        :checked="true"
      />
      <checkbox
        :label="'check03'"
        :checked="true"
      />
    </checkboxGroup>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';
  import checkboxGroup from '@/components/checkbox/checkbox-group';

  export default {
    components: {
      checkbox,
      checkboxGroup,
    },
    data() {
      return {
        visible: true,
        label: 'test',
        checkBoxGroup: [],
        buttonLabel: 'visible',
      };
    },
    methods: {
      onChange(value) {
        console.log(value);
      },
    },
  };
</script>

<style scoped>
</style>
