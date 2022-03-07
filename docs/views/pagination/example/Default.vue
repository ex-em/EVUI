<template>
  <div class="case">
    <ev-pagination
      v-model="current"
      :total="total"
      :per-page="perPage"
      :visible-page="visiblePage"
      :page-info="isPageInfo"
      :order="order"
    >
    </ev-pagination>
    <div class="description">
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">Current Page</span>
          <ev-input-number v-model="current" />
        </div>
        <div class="form-row">
          <span class="badge yellow">Visible Page</span>
          <ev-input-number v-model="visiblePage" />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">Total Data</span>
          <ev-input-number v-model="total" />
        </div>
        <div class="form-row">
          <span class="badge yellow">Data per page</span>
          <ev-input-number v-model="perPage" />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">Order</span>
          <ev-select
            v-model="order"
            :items="orderItems"
            placeholder="Please select value."
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">Page Info</span>
          <ev-toggle v-model="isPageInfo"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import EvPagination from '@/components/pagination/Pagination';
import EvInputNumber from '@/components/inputNumber/InputNumber';

export default {
  components: {
    EvInputNumber,
    EvPagination,
  },
  setup() {
    const visiblePage = ref(8);
    const total = ref(150);
    const current = ref(1);
    const perPage = ref(10);
    const order = ref('left');
    const isPageInfo = ref(false);
    const orderItems = ref([
      { name: 'left', value: 'left' },
      { name: 'right', value: 'right' },
      { name: 'center', value: 'center' },
    ]);

    return {
      total,
      current,
      perPage,
      order,
      isPageInfo,
      visiblePage,
      orderItems,
    };
  },
};
</script>

<style lang="scss" scoped>
.form-rows {
  display: flex;
}
.form-row {
  flex: 1;
  margin: 5px;
  .badge {
    margin-bottom: 3px;
  }
}
.ev-toggle {
  display: block;
}
</style>
