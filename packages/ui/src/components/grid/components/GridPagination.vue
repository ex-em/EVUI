<template>
  <div class="grid-pagination">
    <ev-pagination
      v-model="currentValue"
      :total="total"
      :per-page="perPage"
      :visible-page="visiblePage"
      :show-page-info="showPageInfo"
      :order="order"
      @change="changePage"
    >
    </ev-pagination>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'EvGridPagination',
  props: {
    total: {
      type: [Number, String],
      default: 0,
    },
    visiblePage: {
      type: [Number, String],
      default: 8,
    },
    perPage: {
      type: [Number, String],
      default: 20,
    },
    modelValue: {
      type: [Number, String],
      default: 1,
    },
    showPageInfo: {
      type: Boolean,
      default: false,
    },
    order: {
      type: String,
      default: 'left',
      validator: (val) => ['left', 'right', 'center'].includes(val),
    },
  },
  emits: {
    'update:modelValue': null,
  },
  setup(props, { emit }) {
    const currentValue = ref(props.modelValue);
    const changePage = (page) => {
      currentValue.value = page > 0 ? page : 1;
      emit('update:modelValue', currentValue.value);
    };
    watch(
      () => props.modelValue,
      (value) => {
        currentValue.value = value;
      }
    );
    return {
      currentValue,
      changePage,
    };
  },
};
</script>

<style lang="scss" scoped>
.grid-pagination {
  padding-top: 8px;
}
</style>
