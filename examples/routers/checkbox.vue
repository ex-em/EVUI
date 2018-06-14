<template>
  <div>
    <checkbox
      :label="label2"
    />
    <checkboxGroup
      :list="list"
      :disabled.sync="disabled"
      :checked-list="value"
      @on-change="changeFn"
    />
    <input v-model="value">
    <p>bind-value : {{ value }}</p>
    <checkboxGroup
      :list="list2"
      :checked-list="value"
    />
    <checkboxGroup
      :label="label2"
      :disabled="disabled"
    >
      <checkbox
        :label="'check01'"
        :value="'check01'"
        :disabled="disabled"
      />
      <checkbox
        :label="'check02'"
        :value="'check02'"
        :disabled="disabled"
      />
      <checkbox
        :label="'check03'"
        :value="'check03'"
        :disabled="disabled"
      />
      <checkbox
        :label="'check04'"
        :value="'check04'"
        :disabled="disabled"
      />
      <checkbox
        :label="'check05'"
        :value="'check05'"
        :disabled="disabled"
      />
    </checkboxGroup>
    <checkboxGroup
      :label="label2"
    >
      <checkbox
        :label="'check01'"
        :value="'check01'"
        :disabled="disabled"
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
    <checkbox
      :label="'check01'"
      :value="'check01'"
    />
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
        disabled: true,
        value: [],
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
        list2: [
          {
            label: 'name1',
            checked: true,
          },
          {
            label: 'name2',
            checked: true,
          },
          {
            label: 'name3',
            checked: true,
          },
        ],
      };
    },
    methods: {
      changeFn(data) {
        console.log('outside', data);
      },
    },
  };
</script>
<style scoped>
</style>
