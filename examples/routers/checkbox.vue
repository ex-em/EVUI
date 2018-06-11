<template>
  <div>
    <checkbox
      :label="label2"
    />
    <checkboxGroup
      :list="list"
      :label="label2"/>
    <checkboxGroup :label="label2">
      <checkbox
        :label="'check01'"
        :value="'check01'"
      />
      <checkbox
        :label="'check02'"
        :value="'check02'"
      />
      <checkbox
        :label="'check03'"
        :value="'check03'"
      />
      <checkbox
        :label="'check04'"
        :value="'check04'"
      />
      <checkbox
        :label="'check05'"
        :value="'check05'"
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
        label2: 'test',
        checkBoxGroup: [],
        buttonLabel: 'visible',
        list: [
          {
            label: 'name1',
          },
          {
            label: 'name2',
          },
          {
            label: 'name3',
          },
        ],
      };
    },
    methods: {
    },
  };
</script>
<style scoped>
</style>
