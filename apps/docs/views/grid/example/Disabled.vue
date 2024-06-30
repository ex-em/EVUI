<template>
  <div class="case">
    <ev-grid
      :disabled-rows="disabledRowMv"
      :columns="columns"
      :rows="rows"
      :height="400"
      :option="{
        adjust: true,
        customContextMenu: menuItems,
        useCheckbox: {
          use: true,
          mode: 'multi',
          headerCheck: true,
        },
      }"
    >
      <template #rowDetail="{ item }">
        <row-detail-content
          :data="item.row[2]"
        />
      </template>
    </ev-grid>
    <div class="description">
      <div class="form-row">
        <span class="badge yellow">
          Disabled Row
        </span>
        <ev-text-field
          v-model="disabledRowText"
          type="textarea"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import RowDetailContent from './partitals/RowDetailContent.vue';

export default {
  components: {
    RowDetailContent,
  },
  setup() {
    const menuItems = ref([
      {
        text: 'Menu1',
        click: param => console.log(`[Menu1] Selected Row Data: ${param?.selectedRow}`),
      }, {
        text: 'Menu2',
        click: param => console.log('[Menu2]', param.contextmenuInfo),
      },
    ]);
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
    const disabledRowMv = ref([]);
    const disabledRowText = ref('');
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
    pushData();

    disabledRowMv.value = [rows.value[0], rows.value[1], rows.value[2]];
    let result = '';
    disabledRowMv.value.forEach((row) => {
        result += JSON.stringify(row);
      });
    disabledRowText.value = result;

    return {
      menuItems,
      columns,
      rows,
      disabledRowMv,
      disabledRowText,
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
