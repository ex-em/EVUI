<template>
  <div class="case">
    <ev-grid
      v-model:expanded="expandedRowsMV"
      :columns="columns"
      :rows="rows"
      :height="400"
      :option="{
        adjust: true,
        rowDetail: {
          use: useRowDetail,
        }
      }"
      @expand-row="onExpandRow"
    >
      <template #rowDetail="{ item }">
        <row-detail-content
          :data="item.row[2]"
        />
      </template>
    </ev-grid>
    <div class="description">
      <div class="form-rows">
        <span class="badge yellow">
          Use Row Detail
        </span>
        <ev-toggle
            v-model="useRowDetail"
        />
      </div>
      <div class="form-row">
        <span class="badge yellow">
          Expanded Row
        </span>
        <ev-text-field
            v-model="expandedRowText"
            type="textarea"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import RowDetailContent from './partitals/RowDetailContent.vue';

export default {
  components: {
    RowDetailContent,
  },
  setup() {
    const columns = [
      {
        caption: 'Name', field: 'name', type: 'string',
      },
      {
        caption: 'Column1', field: 'column1', type: 'string',
      },
      {
        caption: 'Column2', field: 'column2', type: 'string',
      },
      {
        caption: 'Column3', field: 'column3', type: 'string',
      },
      {
        caption: 'Column4', field: 'column4', type: 'string', width: 100,
      },
    ];
    const rows = ref([]);
    const useRowDetail = ref(true);
    const expandedRowsMV = ref([]);
    const expandedRowText = ref('');
    const pushData = () => {
      const startIdx = rows.value.length + 1;

      for (let ix = startIdx; ix < startIdx + 30; ix++) {
        rows.value.push([
          `name-${ix}`,
          `column1-${ix}`,
          `column2-${ix}`,
          `column3-${ix}`,
          `column4-${ix}`,
        ]);
      }
    };
    const onExpandRow = (a, b, c, d) => {
      console.log(a);
      console.log(b);
      console.log(c);
      console.log(d);
      let result = '';
      expandedRowsMV.value.forEach((row) => {
        result += JSON.stringify(row);
      });
      expandedRowText.value = result;
    };

    pushData();

    watch(useRowDetail, () => {
      onExpandRow();
    });

    return {
      columns,
      rows,
      useRowDetail,
      expandedRowsMV,
      expandedRowText,
      onExpandRow,
    };
  },
};
</script>

<style lang="scss">
.description {
  .form-rows {
    display: flex;
    margin-bottom: 5px;
  }
  .ev-text-field, .ev-input-number, .ev-select {
    width: 80%;
  }
  .badge {
    margin-bottom: 2px;
    margin-right: 5px !important;
  }
  .ev-toggle {
    margin-right: 10px;
  }
}
</style>
