<template>
  <div
    v-click-outside="onHide"
    :style="`top: ${value.top || 0}px; left: ${value.left || 0}px;`"
    class="evui-table-filter"
  >
    <div
      class="evui-table-filter-row"
      @mouseover.stop="showFilterCondition = false"
      @click="$emit('sort', value.field)"
    >
      <ev-icon
        :cls="'sort-icon ei-s ei-descending'"
      />
      <span>Sort By Descending</span>
    </div>
    <div
      class="evui-table-filter-row"
      @mouseover.stop="showFilterCondition = false"
      @click="$emit('sort', value.field)"
    >
      <ev-icon
        :cls="'sort-icon ei-s ei-ascending'"
      />
      <span>Sort By Ascending</span>
    </div>
    <div
      class="evui-table-filter-row"
      @mouseover.stop="onFilter"
    >
      <ev-checkbox
        v-model="value.use"
        :type="`square`"
        :size="'small'"
      />
      <span>Filter</span>
      <ev-icon
        :cls="'ei-s ei-s-play'"
        style="margin-left: auto; font-size: 14px"
      />
    </div>
    <div
      v-show="showFilterCondition"
      ref="filterCondition"
      class="filter-condition"
    >
      <div class="create-condition">
        <ev-radio-group
          v-model="value.method"
          :size="`small`"
        >
          <ev-radio
            :value="'or'"
            style="font-size: 12px;"
          >
            OR
          </ev-radio>
          <ev-radio
            :value="'and'"
            style="font-size: 12px;"
          >
            AND
          </ev-radio>
        </ev-radio-group>
        <ev-button
          :type="'primary'"
          :size="'small'"
          @click="onAdd"
        >
          Add Condition
        </ev-button>
      </div>
      <div class="condition-list">
        <div
          v-for="(item, index) in conditions"
          :key="item.id"
          class="condition-item"
        >
          <ev-checkbox
            v-model="item.use"
            :value="item.id"
            :type="`square`"
            :size="'small'"
            @on-click="onClick(index)"
          />
          <ev-selectbox
            v-model="item.type"
            :items="defaultCondition[value.type]"
            style="width: 100px;"
          />
          <ev-text-field
            v-model="item.value"
            :type="'text'"
            style="width: 100px;"
            @input="inputFn(index)"
          />
          <ev-icon
            :cls="'ei-s-close'"
            @click="onRemove(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import _ from 'lodash-es';

  export default {
    directives: {
      'click-outside': {
        bind(el, binding) {
          const selectBoxEl = el;
          const bubble = binding.modifiers.bubble;
          const handler = (e) => {
            if (bubble || (selectBoxEl !== e.target && !selectBoxEl.contains(e.target))) {
              binding.value(e);
            }
          };
          selectBoxEl.vueClickOutside = handler;

          document.addEventListener('click', handler);
        },
        unbind(el) {
          const selectBoxEl = el;
          document.removeEventListener('click', selectBoxEl.vueClickOutside);
          selectBoxEl.vueClickOutside = null;
        },
      },
    },
    props: {
      value: {
        type: Object,
        default: null,
      },
      show: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        itemSeq: 0,
        prefixClass: 'evui-table-filter',
        showFilterCondition: false,
        conditions: [],
        defaultCondition: {
          string: [
            { name: 'Equal', value: 'equal' },
            { name: 'Not equal', value: 'notEqual' },
            { name: 'Like', value: 'like' },
            { name: 'Not Like', value: 'notLike' },
          ],
          number: [
            { name: '>', value: 'greaterThan' },
            { name: '<', value: 'lessThan' },
            { name: '=', value: 'equal' },
          ],
        },
        inputFn: _.debounce(this.onInput, 250),
      };
    },
    watch: {
      conditions() {
        this.$set(this.value, 'conditions', this.conditions.filter(condition => !condition.isInit));
      },
    },
    mounted() {
      if (this.value.conditions.length) {
        this.conditions = _.cloneDeep(this.value.conditions);
        this.itemSeq = this.conditions.reduce((maxSeq, condition) => {
          const seq = parseInt(condition.id.split('-')[1], 10);
          if (maxSeq < seq) {
            maxSeq = seq; // eslint-disable-line no-param-reassign
          }

          return maxSeq;
        }, 0);
      } else {
        this.conditions.push({
          id: `item-${this.itemSeq++}`,
          use: true,
          type: this.value.type === 'string' ? 'like' : 'greaterThan',
          value: '',
          isInit: true,
        });
      }
    },
    methods: {
      onInput(index) {
        const condition = this.conditions[index];

        if (condition.isInit) {
          condition.isInit = false;
          if (!this.value.use) {
            this.value.use = true;
          }
        }

        this.conditions.splice(index, 1, condition);
      },
      onHide() {
        this.$emit('update:show', false);
      },
      onFilter({ currentTarget }) {
        this.showFilterCondition = true;
        this.$refs.filterCondition.style.cssText = `
          top: ${currentTarget.offsetTop + 1}px;
          left: ${currentTarget.offsetLeft + currentTarget.offsetWidth + 2}px;`;
      },
      onAdd() {
        this.conditions.push({
          id: `item-${this.itemSeq++}`,
          use: true,
          type: this.value.type === 'string' ? 'like' : 'greaterThan',
          value: '',
          isInit: true,
        });
      },
      onRemove(index) {
        if (index) {
          this.conditions.splice(index, 1);
        } else {
          this.itemSeq = 0;
          this.$set(this.conditions, 0, {
            id: `item-${this.itemSeq++}`,
            use: false,
            type: this.value.type === 'string' ? 'like' : 'greaterThan',
            value: '',
          });
        }
      },
      onClick(index) {
          const condition = this.conditions[index];
          condition.use = !condition.use;
          this.conditions.splice(index, 1, condition);
      },
    },
  };
</script>
<style scoped>
  .evui-table-filter {
    position: absolute;
    background-color: #f0f0f0;
    padding: 2px 0;
  }
  .evui-table-filter-row {
    display: flex;
    align-items: center;
    line-height: 16px;
    font-size: 12px;
    padding: 3px 5px;
  }
  .evui-table-filter-row:hover{
    padding: 2px;
    margin: 0 2px;
    background-color: #e6e6e6;
    border: 1px solid #9d9d9d;
    border-radius: 3px;
    cursor: pointer;
  }
  .sort-icon {
    margin: 0 7px 0 2px;
    font-size: 14px;
  }
  .filter-condition {
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: white;
    box-shadow: 1px 1px 2px 2px #9d9d9d;
    padding: 3px;
  }
  .create-condition {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 3px;
    font-size: 12px;
  }
  .condition-list {
    display: flex;
    flex-direction: column;
  }
  .condition-item {
    display: flex;
    align-items: center;
  }
</style>>
