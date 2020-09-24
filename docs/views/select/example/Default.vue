<template>
  <div class="case">
    <p class="case-title">Common</p>
    <EvSelect
      v-if="isShow"
      v-model="selectVal1"
      :items="items1"
    />
    <br>
    <EvSelect
      v-model="selectVal2"
      :placeholder="'phdsfsdfjsdhfdfgdfgdfsdjkfhsjkdhjkk'"
      :items="items1"
    />
    <div class="description">
      <button
        @click="addItem"
      >
        addItem
      </button>
      first selectbox value : {{ selectVal1 }}
    </div>
    <div class="description">
      <button
        @click="toggleEvSelect"
      >
        ON / OFF
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const selectVal1 = ref('value4');
    const selectVal2 = ref('');
    const items1 = ref([
      {
        name: 'name0name0name0name0name0',
        value: 'value0',
      },
      {
        name: 'name11111111111111111111111111111111111111',
        value: 'value1',
      },
      {
        name: '이름2이름2이름2이름2이름2이름2이름2이름2',
        value: 'value2',
      },
      {
        name: 'name3',
        value: 'value3',
      },
      {
        name: 'name4',
        value: 'value4',
      },
      {
        name: 'name5',
        value: 'value5',
      },
      {
        name: 'name6',
        value: 'value6',
      },
      {
        name: 'name7',
        value: 'value7',
      },
      {
        name: 'name8',
        value: 'value8',
      },
    ]);

    const isShow = ref(true);
    const toggleEvSelect = () => { isShow.value = !isShow.value; };
    const addItem = () => {
      const count = items1.value.length;
      items1.value.push({
        name: `name${count}`,
        value: `value${count}`,
      });
    };

    return {
      isShow,
      toggleEvSelect,
      selectVal1,
      selectVal2,
      items1,
      addItem,
    };
  },
};
</script>

<style lang="scss">
</style>
