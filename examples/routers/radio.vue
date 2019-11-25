<template>
  <div>
    <radio
      v-model="value"
      :label="data2"
    />
    <radio
      v-model="value"
      :label="data2"
      @on-change="onChange"
    />
    <button @click="changeValue"> Change Value </button>
    <p>{{ value }}</p>
    <div>
      <radio-group
        v-model="value2"
        @on-change="onChange"
      >
        <radio
          label="test1"
        />
        <radio
          label="test2"
        />
        <radio
          label="test3"
        />
      </radio-group>
      <p>{{ value2 }}</p>
      <checkbox
        :label="test"
        :disabled="true"
        v-model="a"
      />
      <radio-group
        :list="list"
        :group-align="'hbox'"
        v-model="value2"
        @on-change="onChange"
      />
    </div>
  </div>
</template>

<script>
  import radio from '@/components/radio/radio';
  import radioGroup from '@/components/radio/radio-group';
  import checkbox from '@/components/checkbox/checkbox';

  export default {
    components: {
      radio,
      radioGroup,
      checkbox,
    },
    data() {
      return {
        label: 'label',
        data2: 'test',
        value: false,
        value2: 'test1',
        test: 'aetgaeg',
        a: false,
        list: [
          {
            label: 'a',
          },
          {
            label: 'b',
          },
          {
            label: 'c',
          },
        ],
      };
    },
    methods: {
      onChange(value) {
        console.log(value);
      },
      changeValue() {
        this.value = !this.value;
      },
    },
  };
</script>

<style lang="scss">
  @import '~evui/styles/default';
</style>
