<template>
  <div
    :class="mid ? 'midSpinnerArea' : 'timeSpinnerArea'"
  >
    <div class="timeSpinnerContent">
      <ul
        :from="from"
        :to="to"
        class="spinner-list"
        @mouseover="mouseOver"
        @mouseleave="mouseLeave"
      >
        <li
          v-for="(item, index) in number"
          :key="item"
          :class="index === 0 ? 'active' : ''"
          class="spinner-item"
          @click.stop.prevent="liClick(item)"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import utils from '@/common/utils';

  export default {
    props: {
      id: {
        type: String,
        default() {
          return utils.getId();
        },
      },
      name: {
        type: String,
        default: null,
      },
      from: {
        type: Number,
        default: 0,
      },
      to: {
        type: Number,
        default: 1,
      },
      selectedNumber: {
        type: String,
        default: null,
      },
      mid: {
        type: Boolean,
        default: false,
      },
      selectionStartIndex: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        number: [],
      };
    },
    watch: {
      selectedNumber(number) {
        if (number) {
          const idx = this.findIndexToValue(number);
          if (idx !== null) {
            // move scroll
            this.$el.childNodes[0].scrollTop
              = this.$el.childNodes[0].childNodes[0].childNodes[idx].offsetTop - 76;
            // clicked li activate class
            this.initAllClass();
            this.activeClass(number);
          }
        }
      },
    },
    created() {
      this.makeNumber();
    },
    mounted() {
      if (this.selectedNumber) {
        const number = this.selectedNumber;
        const idx = this.findIndexToValue(number);
        if (idx !== null) {
          // move scroll
          this.$el.childNodes[0].scrollTop
            = this.$el.childNodes[0].childNodes[0].childNodes[idx].offsetTop - 76;
          // clicked li activate class
          this.initAllClass();
          this.activeClass(number);
          // change number to clicked li number
          this.$parent.setInputText(this.selectionStartIndex, number);
        }
      }
    },
    beforeDestroy() {
    },
    activated() {
    },
    methods: {
      makeNumber() {
        for (let ix = this.from, ixLen = this.to; ix <= ixLen; ix++) {
          this.number.push(this.lpad10(ix));
        }
      },
      lpad10(v) {
        let value = v;
        if (value < 10) {
          if (value.length) {
            value = `0${Number(value)}`;
          } else {
            value = `0${value}`;
          }
        }
        return value;
      },
      mouseOver() {
        this.$parent.selectionRangeWord(this.selectionStartIndex);
      },
      mouseLeave() {
        this.$parent.timePickerFirstFocus(this.selectionStartIndex);
      },
      liClick(number) {
        const idx = this.findIndexToValue(number);
        if (idx !== null) {
          // move scroll
          this.$el.childNodes[0].scrollTop
            = this.$el.childNodes[0].childNodes[0].childNodes[idx].offsetTop - 76;
          // clicked li activate class
          this.initAllClass();
          this.activeClass(number);
          // change number to clicked li number
          this.$parent.setInputText(this.selectionStartIndex, number);
        }
      },
      findIndexToValue(number) {
        let findIndex = null;
        for (let ix = 0; ix < this.number.length; ix++) {
          if (this.number[ix].toString() === number.toString()) {
            findIndex = ix;
          }
        }
        return findIndex;
      },
      initAllClass() {
        if (this.number) {
          for (let ix = 0, ixLen = this.number.length; ix < ixLen; ix++) {
            this.$el.childNodes[0].childNodes[0].childNodes[ix].className = 'spinner-item';
          }
        }
      },
      activeClass(number) {
        if (this.number) {
          const ul = this.$el.childNodes[0].childNodes[0];
          for (let ix = 0, ixLen = this.number.length; ix < ixLen; ix++) {
            if (ul.childNodes[ix].innerText.toString() === number.toString()) {
              this.$el.childNodes[0].childNodes[0].childNodes[ix].classList.add('active');
            }
          }
        }
      },
    },
  };
</script>

<style scoped>
  .midSpinnerArea {
    width: 33.2%;
    max-height: 185px;
    display: inline-block;
  }
  .timeSpinnerArea {
    width: 33.3%;
    max-height: 185px;
    display: inline-block;
  }

  .timeSpinnerContent{
    max-height: inherit;
    overflow: scroll;
    height: 100%;
    font-size: 0px; /*width 33.3% inline-block 시 필요*/
  }
  .timeSpinnerContent::-webkit-scrollbar
  {
    width: 5px;
    height: 0px;
    background-color: rgba(0,0,0,0);
  }

  .timeSpinnerContent:hover
  {
    overflow: scroll;
  }
  .timeSpinnerContent:hover::-webkit-scrollbar
  {
    width: 5px;
    height: 0px;
    background-color: #ffffff;
  }
  .timeSpinnerContent:hover::-webkit-scrollbar-thumb
  {
    border-radius: 4px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.1);
    background-color: rgba(0,0,0,.1);
  }

  .spinner-list {
    margin: 0;
    padding: 76px 0 78px 0;
    list-style: none;
    text-align: center;
    cursor: pointer;
  }
  .first {
    margin-left: 5px;
  }
  .spinner-list .spinner-item {
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    display: list-item;
    user-select: none; /* prevent text drag */
  }

  .spinner-list .spinner-item:hover {
    background-color: #f5f7fa;
  }
  .spinner-list .spinner-item.active,
  .spinner-list .spinner-item.active:hover {
    background-color: #41B883;
    color: #ffffff;
  }
</style>
