<template>
  <template v-if="isShowFilterSetting">
    <teleport to="#ev-grid-filter-setting-modal">
      <section
        v-clickoutside="() => { isShowFilterSetting = false }"
        class="ev-grid-filter-setting"
        :style="{
          top: $props.position.top,
          left: $props.position.left,
        }"
      >
        <div class="ev-grid-filter-setting__header">
          <ev-icon icon="ev-icon-filter-list"></ev-icon>
          <span class="header-title"> Filter ({{$props.column.caption}}) </span>
        </div>
        <div class="ev-grid-filter-setting__content">
          <div
            v-for="(item, idx) in filteringItems"
            :key="idx"
            class="ev-grid-filter-setting__row">
            <ev-select
              v-model="item.operator"
              class="ev-grid-filter-setting__row--operator"
              :title="getSelectTitle(items1, item.operator)"
              :items="items1"
              :disabled="idx > 1"
              :style="{
                visibility: idx > 0 ? 'visible' : 'hidden',
              }"
              @change="changeOperator"
            />
            <ev-select
              v-model="item.comparison"
              class="ev-grid-filter-setting__row--comparison"
              :title="getSelectTitle(items2, item.comparison)"
              :items="items2"
              @change="changeComparison(item.comparison, idx)"
            />
            <ev-select
              v-if="$props.column.type === 'boolean'"
              v-model="item.value"
              class="ev-grid-filter-setting__row--comparison"
              :items="booleanItems"
            />
            <ev-text-field
              v-else
              v-model="item.value"
              class="ev-grid-filter-setting__row--value"
              :disabled="item.comparison === 'isEmpty' || item.comparison === 'isNotEmpty'"
              @input="validateValue($props.column.type, item)"
            />
            <div
              class="ev-grid-filter-setting__row--button"
            >
              <ev-icon
                icon="ev-icon-trash2"
                @click="removeRow(idx)"
              />
            </div>
          </div>
        </div>
        <div class="ev-grid-filter-setting__footer">
          <ev-button
            type="primary"
            @click="applyFiltering"
          >
            OK
          </ev-button>
        </div>
      </section>
    </teleport>
  </template>
</template>

<script>
import { clickoutside } from '@/directives/clickoutside';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { cloneDeep } from 'lodash-es';

export default {
  name: 'EVGridFilterSetting',
  directives: {
    clickoutside,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Object,
      default: () => ({
        top: 0,
        left: 0,
      }),
    },
    column: {
      type: Object,
      default: () => ({}),
    },
    items: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: {
    'update:isShow': null,
    'apply-filtering': null,
  },
  setup(props, { emit }) {
    const filteringItems = ref([]);
    const filteringColumn = computed(() => props.column);
    // const columnField = computed(() => {
    //   console.log(props.column);
    //   return props.column?.field;
    // });
    const items1 = [
      { name: 'AND', value: 'and' },
      { name: 'OR', value: 'or' },
    ];
    const booleanItems = [
      { name: 'true', value: 'true' },
      { name: 'false', value: 'false' },
    ];
    const numberItems = [
      { name: '=', value: '=' },
      { name: '!=', value: '!=' },
      { name: '<', value: '<' },
      { name: '>', value: '>' },
      { name: '<=', value: '<=' },
      { name: '>=', value: '>=' },
    ];
    const stringItems = [
      { name: 's%', value: 's%' }, // starts with
      { name: '%s', value: '%s' }, // ends with
      { name: '%s%', value: '%s%' }, // contains
      { name: 'Not Like', value: 'notLike' }, // does not contains
      { name: '=', value: '=' }, // is
      { name: '!=', value: '!=' }, // is not
    ];
    const commonItems = [
      { name: 'Is empty', value: 'isEmpty' },
      { name: 'Is not empty', value: 'isNotEmpty' },
    ];
    const getComparisonItems = (columnType) => {
      if (columnType === 'string' || columnType === 'stringNumber') {
        return [...stringItems, ...commonItems];
      } else if (columnType === 'number' || columnType === 'float') {
        return [...numberItems, ...commonItems];
      } else if (columnType === 'boolean') {
        return [
          { name: '=', value: '=' },
        ];
      }
      return [];
    };
    const items2 = computed(() => getComparisonItems(props.column.type));
    const isShowFilterSetting = computed({
      get: () => props.isShow,
      set: val => emit('update:isShow', val),
    });
    const addRow = () => {
      const operator = filteringItems.value.length >= 2 ? filteringItems.value[1].operator : 'and';
      filteringItems.value.push({
        comparison: '=',
        operator,
        value: '',
        caption: filteringColumn.value.caption,
      });
    };
    const removeRow = (idx) => {
      if (filteringItems.value.length > 1) {
        filteringItems.value.splice(idx, 1);
      } else if (idx === 0) {
        filteringItems.value[0].comparison = '=';
        filteringItems.value[0].value = '';
      }
    };
    const changeComparison = (comparison, idx) => {
      if (comparison === 'isEmpty' || comparison === 'isNotEmpty') {
        filteringItems.value[idx].value = '';
      }
    };
    const changeOperator = (val) => {
      filteringItems.value = filteringItems.value.map(item => ({ ...item, operator: val }));
    };
    const applyFiltering = () => {
      emit(
        'apply-filtering',
        filteringColumn.value.field,
        filteringItems.value.filter(item => item.value
          || item.comparison === 'isEmpty' || item.comparison === 'isNotEmpty'),
      );
    };
    watch(
      () => props.isShow,
      (isShow) => {
        const rowList = [];
        const items = cloneDeep(props.items);
        if (isShow && filteringColumn.value.field) {
          if (!items[filteringColumn.value.field]?.length) {
            rowList.push({
              comparison: '=',
              operator: 'and',
              value: '',
              caption: filteringColumn.value.caption,
            });
          } else {
            items[filteringColumn.value.field].forEach((row) => {
              rowList.push(row);
            });
          }
          filteringItems.value = rowList;
        }
      },
    );

    const getSelectTitle = (items, title) => items.find(item => item.value === title)?.name || '';

    const initWrapperDiv = () => {
      const root = document.createElement('div');
      root.id = 'ev-grid-filter-setting-modal';
      root.setAttribute('style', 'position: absolute; top: 0; left: 0;');
      const hasRoot = document.getElementById('ev-grid-filter-setting-modal');
      if (!hasRoot) {
        document.body.appendChild(root);
      }
    };

    onBeforeMount(() => {
      initWrapperDiv();
    });

    const validateValue = (type, item) => {
      if (type === 'number' || type === 'float') {
        item.value = item.value.replace(/[^0-9.]/g, '');
      }
    };
    return {
      filteringItems,
      isShowFilterSetting,
      items1,
      items2,
      booleanItems,
      addRow,
      removeRow,
      changeOperator,
      applyFiltering,
      changeComparison,
      getSelectTitle,
      validateValue,
    };
  },
};
</script>

<style lang="scss">
.ev-grid-filter-setting {
  position: absolute;
  width: auto;
  border: 1px solid #D0D0D0;
  background: #FFFFFF;
  font-size: 12px;
  z-index: 1;
  &__header {
    padding: 10px;

    .ev-text-field {
      margin-top: 10px;
    }
  }
  &__row {
    display: flex;
    width: 100%;
    padding: 6px 0;
    gap: 5px;
    .ev-select__wrapper {
      width: inherit;
    }
    &--operator {
      width: 80px;
    }
    &--comparison {
      width: 120px;
    }
    &--value {
      width: 120px;
    }
    &--button {
      display: flex;
      justify-content: center;
      align-items: center;
      &.add {
        padding: 6px 0;
        justify-content: end;
      }
      i {
        font-size: 22px;
        margin-left: 8px;
        &:hover {
          opacity: 0.6;
          cursor: pointer;
        }
      }
    }
  }
  &__content {
    padding: 0 10px;
    border-top: 1px solid #CED4DA;
    border-bottom: 1px solid #CED4DA;
  }

  &__footer {
    display: flex;
    padding: 5px 10px;

    .ev-button {
      margin-left: auto;
    }
  }
}
</style>
