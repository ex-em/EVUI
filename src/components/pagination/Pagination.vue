<template>
  <nav class="pagination">
    <!-- Page Info -->
    <small v-if="showPageInfo" class="pagination-info">
      <template v-if="perPage === 1">
        {{ firstData }} / {{ total }}
      </template>
      <template v-else>
        {{ firstData }} - {{ Math.min(current * perPage, total) }}
        / {{ total }}
      </template>
    </small>

    <ul class="pagination-list" :style="listClasses">
      <!-- Jump -->
      <li v-if="$props.pagePerJump"
        class="step-button"
        :class="{'is-disabled': !hasPrev}">
        <page-button
          class="pagination-previous"
          :disabled="!hasPrev"
          :page="getPage(prevJumpPage, {isCurrent: false})"
        >
          <ev-icon icon="ev-icon-s-double-left"/>
        </page-button>
      </li>

      <!-- Previous -->
      <li
        class="step-button"
      :class="{'is-disabled': !hasPrev}">
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
      <li
      class="step-button"
      :class="{'is-disabled': !hasNext}">
        <page-button
          class="pagination-next"
          :disabled="!hasNext"
          :page="getPage(current + 1)"
        >
          <ev-icon icon="ev-icon-s-arrow-right"/>
        </page-button>
      </li>

      <!-- Jump -->
      <li v-if="$props.pagePerJump"
      class="step-button"
      :class="{'is-disabled': !hasNext}">
        <page-button
          class="pagination-previous"
          :disabled="!hasNext"
          :page="getPage(nextJumpPage, {isCurrent: false})"
        >
          <ev-icon icon="ev-icon-s-double-right"/>
        </page-button>
      </li>

    </ul>
  </nav>
</template>

<script>
import { computed, nextTick, watch } from 'vue';
import EvIcon from '@/components/icon/Icon';
import pageButton from './pageButton';

export default {
  name: 'EvPagination',
  components: {
    EvIcon,
    pageButton,
  },
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
      validator: val => ['left', 'right', 'center'].includes(val),
    },
    pagePerJump: {
      type: [Number, undefined],
      default: undefined,
    },
  },
  emits: {
    'update:modelValue': null,
    change: null,
  },
  setup(props, { emit }) {
    const visiblePage = computed(() => (props.visiblePage > 7 ? props.visiblePage : 7));
    const current = computed(() => props.modelValue);
    const pageCount = computed(() => (props.total === 0
      ? 1 : Math.ceil(props.total / props.perPage)));
    const hasPrev = computed(() => current.value > 1);
    const hasNext = computed(() => current.value < pageCount.value);

    const prevJumpPage = computed(
      () => Math.max(current.value - props.pagePerJump, 1),
    );
    const nextJumpPage = computed(
      () => Math.min(current.value + props.pagePerJump, pageCount.value),
    );

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
      isCurrent: options.isCurrent ?? current.value === num,
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
          changePage(value);
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
      prevJumpPage,
      nextJumpPage,
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
    cursor: pointer;
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
