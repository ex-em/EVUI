<template>
  <nav class="pagination">
    <!-- Page Info -->
    <small v-if="pageInfo" class="pagination-info">
      <template v-if="perPage === 1">
        {{ numberWithComma(firstData) }} / {{ numberWithComma(total) }}
      </template>
      <template v-else>
        {{ numberWithComma(firstData) }} - {{ numberWithComma(Math.min(current * perPage, total)) }}
        / {{ numberWithComma(total) }}
      </template>
    </small>
    <ul class="pagination-list" :style="listClasses">
      <!-- Previous -->
      <li :class="{'is-disabled': !hasPrev}">
        <page-button
          class="pagination-previous"
          :disabled="!hasPrev"
          :page="getPage(current - 1)"
        >
          <ev-icon icon="ev-icon-s-arrow-left"/>
        </page-button>
      </li>

      <!--Pages-->
      <template v-for="(page, i) in pagesInRange" :key="i">
        <li v-if="page.number === -1" class="pagination-ellipsis">
          <span>&hellip;</span>
        </li>
        <li v-else :class="{ 'is-current': page.isCurrent, 'is-page': true }" @click="page.click">
          <page-button :page="page"/>
        </li>
      </template>

      <!-- Next -->
      <li :class="{'is-disabled': !hasNext}">
        <page-button
          class="pagination-next"
          :disabled="!hasNext"
          :page="getPage(current + 1)"
        >
          <ev-icon icon="ev-icon-s-arrow-right"/>
        </page-button>
      </li>
    </ul>
  </nav>
</template>

<script>
import { computed, nextTick, watch } from 'vue';
import EvIcon from '@/components/icon/Icon';
import { numberWithComma } from '@/common/utils';
import pageButton from './pageButton';

export default {
  name: 'EvPagination',
  components: {
    EvIcon,
    pageButton,
  },
  props: {
    total: [Number, String],
    visiblePage: [Number, String],
    perPage: {
      type: [Number, String],
      default: 20,
    },
    modelValue: {
      type: [Number, String],
      default: 1,
    },
    size: String,
    pageInfo: Boolean,
    order: {
      type: String,
      default: 'left',
      validator: val => ['left', 'right', 'center'].includes(val),
    },
  },
  emits: {
    'update:modelValue': null,
    change: null,
  },
  setup(props, { emit }) {
    const visiblePage = computed(() => props.visiblePage || 8);
    const current = computed(() => props.modelValue);
    const pageCount = computed(() => Math.ceil(props.total / props.perPage));
    const hasPrev = computed(() => current.value > 1);
    const hasNext = computed(() => current.value < pageCount.value);
    const firstData = computed(() => {
      const item = current.value * props.perPage - props.perPage + 1;
      return item >= 0 ? item : 0;
    });
    const changePage = (num, event) => {
      if (current.value === num || num < 1 || num > pageCount.value) return;
      emit('update:modelValue', num);
      emit('change', num);
      if (event && event.target) {
        nextTick(() => event.target.focus());
      }
    };
    const getPage = (num, options = {}) => ({
      number: num,
      isCurrent: current.value === num,
      click: event => changePage(num, event),
      input: (event, inputNum) => changePage(+inputNum, event),
      disabled: options.disabled || false,
      class: options.class || '',
    });
    const onRange = (from, to) => {
      const range = [];
      const f = from > 0 ? from : 1;

      for (let i = f; i <= to; i++) {
        range.push(getPage(i));
      }

      return range;
    };
    const pagesInRange = computed(() => {
      const totalVisible = parseInt(visiblePage.value, 10);

      if (totalVisible === 0) {
        return [];
      }

      const maxLength = Math.min(
        Math.max(0, totalVisible) || pageCount.value,
        pageCount.value,
      );
      if (pageCount.value <= maxLength) {
        return onRange(1, pageCount.value);
      }
      const even = maxLength % 2 === 0 ? 1 : 0;
      const left = Math.floor(maxLength / 2);
      const right = pageCount.value - left + 1 + even;

      if (current.value > left && current.value < right) {
        const firstItem = 1;
        const lastItem = pageCount.value;
        const start = current.value - left + 2;
        const end = current.value + left - 2 - even;
        const secondItem = start - 1 === firstItem + 1 ? 2 : -1;
        const beforeLastItem = end + 1 === lastItem - 1 ? end + 1 : -1;
        return [
          getPage(1),
          getPage(secondItem),
          ...onRange(start, end),
          getPage(beforeLastItem),
          getPage(pageCount.value),
        ];
      } else if (current.value === left) {
        const end = current.value + left - 1 - even;
        return [...onRange(1, end), getPage(-1), getPage(pageCount.value)];
      } else if (current.value === right) {
        const start = current.value - left + 1;
        return [getPage(1), getPage(-1), ...onRange(start, pageCount.value)];
      }
      return [
        ...onRange(1, left),
        getPage(-1),
        ...onRange(right, pageCount.value),
      ];
    });
    const listClasses = computed(() => ({ 'justify-content': props.order, flex: '3 1 0%' }));

    watch(
      () => pageCount.value,
      (value) => {
        if (current.value > value) {
          changePage(1);
        }
      },
    );
    watch(
      () => current.value,
      (after, before) => {
        if (pageCount.value < after) {
          changePage(before);
        }
      },
    );
    return {
      pageCount,
      pagesInRange,
      hasPrev,
      hasNext,
      listClasses,
      firstData,
      current,
      changePage,
      getPage,
      numberWithComma,
    };
  },
};
</script>

<style lang="scss">
.pagination {
  display: flex;
  .pagination-next,
  .pagination-previous {
    margin: 0;
    padding-left: 10px;
    padding-right: 10px;
    background: center center no-repeat;
    background-size: 16px;
    background-color: #FFFFFF;
    cursor: pointer;
    color: #303133;
    &:hover {
      color: #1A6AFE;
    }
  }
  &-info {
    order: 2;
    line-height: 32px;
  }
  .is-current {
    pointer-events: none;
    cursor: not-allowed;
    background-color: #1A6AFE;
    color: #FFFFFF;
    border-radius: 4px;
  }
  .is-page {
    &:hover {
      color: #1A6AFE;
    }
  }
  .pagination-ellipsis {
    pointer-events: none;
    cursor: not-allowed;
  }
  .is-disabled {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.5;
    color: #C0C4CC;
    background-color: #FFFFFF;
  }
  &-list {
    display: flex;
    user-select: none;
    list-style: none;
    font-size: 0;
    padding: 0;
    margin: 0;
    align-items: center;
    flex-wrap: wrap;
    li {
      display: flex;
      height: 32px;
      padding: 0 4px;
      justify-content: center;
      align-items: center;
      background: #FFFFFF;
      font-size: 14px;
      min-width: 32px;
      line-height: 32px;
      cursor: pointer;
      box-sizing: border-box;
      text-align: center;
    }
  }
}
</style>
