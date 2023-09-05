<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-select
      v-model="selectVal1"
      :items="items1"
      placeholder="Please select value."
      @change="changeSelect1"
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
      change val : {{ selectEventVal.val }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled Item</p>
    <ev-select
      v-model="selectVal3"
      :items="items3"
    />
    <div class="description">
      <button
        @click="disableIdx1"
      >
        Disable Items[1]
      </button>
      selected value : {{ selectVal3 }}
    </div>
    <div class="description">
      items : {{ items3 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled Select</p>
    <ev-select
      v-model="selectVal4"
      :items="items4"
      :disabled="isDisabled"
    />
    <br>
    <div class="description">
      <button
        @click="disableSelect"
      >
        Disable Selectbox
      </button>
      selected value : {{ selectVal4 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Clearable Select</p>
    <ev-select
      v-model="selectVal4"
      :items="items4"
      placeholder="Please Select Item."
      clearable
    />
  </div>
  <div class="case">
    <p class="case-title">Filterable Select</p>
    <ev-select
      v-model="selectVal4"
      :items="items4"
      placeholder="Please Select Item."
      filterable
    />
  </div>
  <div class="case">
    <p class="case-title">Icon</p>
    <ev-select
      v-model="selectVal5"
      :items="items5"
      placeholder="Please select value."
      @change="changeSelect1"
    />
    <div class="description">
      val : {{ selectVal5 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Checkable Select</p>
    <ev-select
      v-model="selectVal4"
      :items="items4"
      checkable
      placeholder="Please select value."
      @change="changeSelect1"
    />
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  setup() {
    const selectVal1 = ref('');
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
    const selectEventVal = reactive({
      e: null,
      val: null,
    });

    const addItem = () => {
      const count = items1.value.length;
      items1.value.push({
        name: `name${count}`,
        value: `value${count}`,
      });
    };
    const changeSelect1 = (val) => {
      selectEventVal.val = val;
    };

    const selectVal3 = ref('value1');
    const items3 = ref([
      {
        name: 'name1',
        value: 'value1',
      },
      {
        name: 'name2',
        value: 'value2',
        disabled: true,
      },
      {
        name: 'name3',
        value: 'value3',
      },
    ]);
    const disableIdx1 = () => {
      items3.value[1].disabled = !items3.value[1].disabled;
    };

    const selectVal4 = ref('value2');
    const items4 = ref([
      {
        name: 'name1',
        value: 'value1',
      },
      {
        name: 'name2',
        value: 'value2',
      },
      {
        name: 'name3',
        value: 'value3',
      },
      {
        name: 'name13',
        value: 'value13',
      },
      {
        name: 'name23',
        value: 'value23',
      },
      {
        name: 'name33',
        value: 'value33',
      },
      {
        name: '인스턴스 A',
        value: 'instance A',
      },
      {
        name: '인스턴스 B',
        value: 'instance B',
      },
      {
        name: '인스턴트 식품',
        value: 'instant grocery',
      },
      {
        name: 'A 인스턴스',
        value: 'A instance',
      },
      {
        name: 'B 인스턴스',
        value: 'B instance',
      },
    ]);
    const isDisabled = ref(true);
    const disableSelect = () => { isDisabled.value = !isDisabled.value; };

    const selectVal5 = ref();
    const items5 = ref([
      {
        name: 'name0',
        value: 'value0',
        iconClass: 'ev-icon-query',
      },
      {
        name: 'name1',
        value: 'value1',
      },
      {
        name: 'name2',
        value: 'value2',
        iconClass: '',
      },
      {
        name: 'name3',
        value: 'value3',
        iconClass: 'ev-icon-bell',
      },
      {
        name: 'name4',
        value: 'value4',
        iconClass: 'ev-icon-close2',
      },
    ]);

    return {
      selectVal1,
      items1,
      selectEventVal,
      addItem,
      changeSelect1,

      selectVal3,
      items3,
      disableIdx1,

      selectVal4,
      items4,
      isDisabled,
      disableSelect,

      selectVal5,
      items5,
    };
  },
};
</script>

<style lang="scss">
</style>
