<template>
  <template v-if="isShowColumnSetting">
    <teleport to="#ev-grid-column-setting-modal">
      <section
        ref="columnSettingWrapper"
        v-clickoutside="hideColumnSetting"
        class="ev-grid-column-setting"
        :style="columnSettingStyle"
      >
        <div class="ev-grid-column-setting__header">
          <p class="header-title"> {{ textInfo.title }} </p>
          <ev-text-field
            v-model="searchVm"
            type="search"
            :placeholder="textInfo.search"
            @input="onSearchColumn"
          />
        </div>
        <div class="ev-grid-column-setting__content">
          <template v-if="columnList.length">
            <ev-checkbox-group
              v-model="checkColumnGroup"
              @change="onCheckColumn"
            >
              <ev-checkbox
                v-for="(column, idx) in columnList"
                :key="`column_${idx}`"
                :label="column?.text"
                :tooltip-title="column?.label ?? ''"
              >
                {{ column?.label }}
              </ev-checkbox>
            </ev-checkbox-group>
          </template>
          <template v-else>
            <p class="is-empty"> {{ textInfo.empty }} </p>
          </template>
        </div>
        <div class="ev-grid-column-setting__footer">
          <ev-button
            type="primary"
            :disabled="isDisabled"
            @click="onApplyColumn"
          >
            {{ textInfo.ok }}
          </ev-button>
        </div>
      </section>
    </teleport>
  </template>
</template>

<script>
import { clickoutside } from '@/directives/clickoutside';
import {
  computed,
  nextTick,
  onBeforeMount,
  reactive,
  ref,
  watch,
} from 'vue';
import { cloneDeep } from 'lodash-es';

export default {
  name: 'EVGridColumnSetting',
  directives: {
    clickoutside,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: [Array],
      default: () => [],
    },
    hiddenColumn: {
      type: String,
      default: '',
    },
    position: {
      type: Object,
      default: () => ({
        top: 0,
        left: 0,
        columnListMenuWidth: 0,
      }),
    },
    isShowMenuOnClick: {
      type: Boolean,
      default: false,
    },
    textInfo: {
      type: Object,
      default: () => ({
        title: 'Column List',
        search: 'Search',
        empty: 'No records',
        ok: 'OK',
      }),
    },
  },
  emits: {
    'update:isShow': [Boolean],
    'update:isShowMenuOnClick': [Boolean],
    'apply-column': null,
  },
  setup(props, { emit }) {
    const isShowColumnSetting = computed({
      get: () => props.isShow,
      set: val => emit('update:isShow', val),
    });

    const columnSettingWrapper = ref(null);
    const searchVm = ref('');
    const isSearch = ref(false);
    const checkColumnGroup = ref([]);
    const originColumnList = ref([]);
    const searchColumnList = ref([]);
    const applyColumnList = ref([]);
    const columnList = computed(() => (isSearch.value
      ? searchColumnList.value : originColumnList.value));
    const isDisabled = computed(() => !columnList.value.length);
    let timer = null;
    let lastCheckedColumn = null;
    const columnSettingStyle = reactive({
      top: null,
      left: null,
    });
    const computedIsShowMenuOnClick = computed({
      get: () => props.isShowMenuOnClick,
      set: val => emit('update:isShowMenuOnClick', val),
    });

    const onCheckColumn = (columns) => {
      if (columns?.length === 1) {
        lastCheckedColumn = columns[0];
      } else if (columns?.length < 1 && lastCheckedColumn !== null) { // 최소 한개 컬럼은 선택되도록
        checkColumnGroup.value.push(lastCheckedColumn);
      }
    };

    const onSearchColumn = (searchWord) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        isSearch.value = false;

        if (searchWord) {
          const lowerCasedSearchWord = searchWord.toString().toLowerCase();
          searchColumnList.value = originColumnList.value.filter((column) => {
            const columnName = column.label.toString().toLowerCase();
            return columnName.includes(lowerCasedSearchWord);
          });

          isSearch.value = true;
        }
      }, 500);
    };

    const initSearchValue = () => {
      searchVm.value = '';
      isSearch.value = false;
      searchColumnList.value.length = 0;
    };

    const initValue = () => {
      const columns = applyColumnList.value.length ? applyColumnList.value : originColumnList.value;
      
      checkColumnGroup.value = columns
        .filter(col => col.originChecked)
        .map(col => col.text);
      
      initSearchValue();
    };
    const onApplyColumn = () => {
      applyColumnList.value = originColumnList.value
        .filter(col => checkColumnGroup.value.includes(col.text));
      const checkedColumns = applyColumnList.value.map(col => col.text);

      emit('apply-column', checkedColumns);
      isShowColumnSetting.value = false;
      computedIsShowMenuOnClick.value = false;
    };

    const prevColumns = ref();
    const prevCheckColumnGroup = ref();
    const setColumns = () => {
      prevCheckColumnGroup.value = cloneDeep(checkColumnGroup.value);
      originColumnList.value = props.columns
        .filter(col => !col.hide && col.caption)
        .map((col) => {
          const prevColumn = prevColumns.value?.find(c => c.field === col.field);
          let isChecked = false;

          if (prevColumn) {
            const isHiddenChanged = prevColumn?.hiddenDisplay !== col?.hiddenDisplay;
            isChecked = isHiddenChanged || !prevCheckColumnGroup.value?.length
              ? !col?.hiddenDisplay
              : prevCheckColumnGroup.value.includes(col.field);
          } else {
            isChecked = !col.hiddenDisplay;
          }
          return {
            label: col.caption,
            text: col.field,
            originChecked: !col.hiddenDisplay,
            checked: isChecked,
          };
        });

      checkColumnGroup.value = originColumnList.value
        .filter(col => col.checked)
        .map(col => col.text);
      applyColumnList.value.length = 0;
      prevColumns.value = cloneDeep(props.columns);
    };

    const hideColumnSetting = () => {
      isShowColumnSetting.value = false;
      computedIsShowMenuOnClick.value = false;
    };

    const initWrapperDiv = () => {
      const root = document.createElement('div');
      root.id = 'ev-grid-column-setting-modal';
      root.setAttribute('style', 'position: absolute; top: 0; left: 0;');
      const hasRoot = document.getElementById('ev-grid-column-setting-modal');
      if (!hasRoot) {
        document.body.appendChild(root);
      }
    };

    const setPosition = async () => {
      await nextTick();

      const docWidth = document.documentElement.clientWidth;
      const docHeight = document.documentElement.clientHeight;
      const columnSettingWrapperRect = columnSettingWrapper.value?.getBoundingClientRect();
      const columnSettingWidth = columnSettingWrapperRect?.width;
      const columnSettingHeight = columnSettingWrapperRect?.height;

      const { top, left, columnListMenuWidth } = props.position;
      let columnSettingLeft;

      if (columnListMenuWidth) { // 컨텍스트 메뉴일 때
        columnSettingLeft = left;

        if (docWidth < left + columnSettingWidth) {
          columnSettingLeft = left - columnSettingWidth - columnListMenuWidth;
        }
      } else {
        columnSettingLeft = left - columnSettingWidth;
      }
      const maximumPosY = docHeight - columnSettingHeight;
      columnSettingStyle.top = `${Math.min(top, maximumPosY) + document.documentElement.scrollTop}px`;
      columnSettingStyle.left = `${columnSettingLeft + document.documentElement.scrollLeft}px`;
    };

    onBeforeMount(() => initWrapperDiv());

    watch(() => props.columns, () => {
      setColumns();
    }, { immediate: true, deep: true });

    watch(() => isShowColumnSetting.value, async () => {
      initValue();

      if (isShowColumnSetting.value) {
        await setPosition();
      }
    });

    watch(() => props.hiddenColumn, (value) => {
      const filterColumns = applyColumnList.value.length
        ? applyColumnList.value.filter(col => col.text !== value)
        : originColumnList.value.filter(col => (col.text !== value && col.checked));

      applyColumnList.value = filterColumns;
      checkColumnGroup.value = filterColumns.map(col => col.text);
    });

    return {
      columnSettingWrapper,
      columnSettingStyle,
      isShowColumnSetting,
      checkColumnGroup,
      columnList,
      searchVm,
      isDisabled,
      onSearchColumn,
      onApplyColumn,
      onCheckColumn,
      hideColumnSetting,
    };
  },
};
</script>

<style lang="scss">
.ev-grid-column-setting {
  position: absolute;
  width: 180px;
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

  &__content {
    height: 120px;
    padding: 0 10px;
    border-top: 1px solid #CED4DA;
    border-bottom: 1px solid #CED4DA;
    overflow: auto;

    .ev-checkbox {
      display: block;
      padding: 10px 0;

      .ev-checkbox-label {
        width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .is-empty {
      height: 30px;
      text-align: center;
    }
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
