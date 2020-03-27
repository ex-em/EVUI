<template>
  <div
    :class="mid ? 'evui-timepicker-spinner-between' : 'evui-timepicker-spinner-first-last'"
  >
    <div
      ref="spinnerContent"
      class="evui-timepicker-spinner-content"
    >
      <ul
        :from="from"
        :to="to"
        class="evui-timepicker-spinner-list"
        @mouseover="mouseOver"
        @mouseleave="mouseLeave"
      >
        <li
          v-for="(item, index) in liNumberArr"
          ref="spinnerLi"
          :key="item"
          :class="index === 0 ? 'active' : ''"
          class="evui-timepicker-spinner-item"
          @click.stop.prevent="liClick(true, item)"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
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
        default: '',
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
        liNumberArr: [],
      };
    },
    watch: {
      selectedNumber(liNumber) {
        this.liClick(false, liNumber);
      },
    },
    created() {
      this.makeNumber();
    },
    mounted() {
      this.liClick(true);
    },
    methods: {
      makeNumber() {
        for (let ix = this.from, ixLen = this.to; ix <= ixLen; ix++) {
          this.liNumberArr.push(this.lpad10(ix));
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
        } else {
          value = `${value}`;
        }
        return value;
      },
      mouseOver() {
        this.$emit('setRange', this.selectionStartIndex);
      },
      mouseLeave() {
        this.$emit('setFocus', this.selectionStartIndex);
      },
      liClick(isClick, liNumber) {
        const clickedNumber = liNumber || this.selectedNumber;
        const clickFlag = isClick;
        if (typeof clickedNumber === 'string' && clickedNumber.length === 2) {
          const idx = this.findIndexToValue(clickedNumber);
          if (idx !== null) {
            // move scroll
            this.$refs.spinnerContent.scrollTop = this.$refs.spinnerLi[idx].offsetTop - 76;
            this.initAllClass();
            this.activeClass(clickedNumber);
            if (clickFlag) {
              // change number to clicked li number
              this.$emit('setInput', this.selectionStartIndex, clickedNumber);
            }
          }
        }
      },
      findIndexToValue(clickedNumber) {
        let findIndex = null;
        for (let ix = 0, ixLen = this.liNumberArr.length; ix < ixLen; ix++) {
          if (this.liNumberArr[ix] === clickedNumber) {
            findIndex = ix;
            break;
          }
        }
        return findIndex;
      },
      initAllClass() {
        for (let ix = 0, ixLen = this.liNumberArr.length; ix < ixLen; ix++) {
          this.$refs.spinnerLi[ix].className = 'evui-timepicker-spinner-item';
        }
      },
      activeClass(clickedNumber) {
        for (let ix = 0, ixLen = this.liNumberArr.length; ix < ixLen; ix++) {
          if (this.$refs.spinnerLi[ix].innerText === clickedNumber) {
            this.$refs.spinnerLi[ix].classList.add('active');
          }
        }
      },
    },
  };
</script>

<style scoped>
  .evui-timepicker-spinner-between {
    display: inline-block;
    width: 33.2%;
    max-height: 185px;
  }
  .evui-timepicker-spinner-first-last {
    display: inline-block;
    width: 33.3%;
    max-height: 185px;
  }

  .evui-timepicker-spinner-content {
    overflow: scroll;
    height: 100%;
    max-height: inherit;
    font-size: 0; /* width 33.3% inline-block 시 필요 */
  }
  .evui-timepicker-spinner-content::-webkit-scrollbar {
    width: 5px;
    height: 0;
    background-color: rgba(0,0,0,0);
  }

  .evui-timepicker-spinner-content:hover {
    overflow: scroll;
  }

  .evui-timepicker-spinner-content:hover::-webkit-scrollbar {
    width: 5px;
    height: 0;
    background-color: #FFFFFF;
  }

  .evui-timepicker-spinner-content:hover::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0,0,0,.1);
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.1);
  }

  .evui-timepicker-spinner-list {
    list-style: none;
    margin: 0;
    padding: 76px 0 78px 0;
    text-align: center;
    cursor: pointer;
  }

  .evui-timepicker-spinner-list .evui-timepicker-spinner-item {
    display: list-item;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    user-select: none; /* prevent text drag */
  }

  .evui-timepicker-spinner-list .evui-timepicker-spinner-item:hover {
    background-color: #F5F7FA;
  }
  .evui-timepicker-spinner-list .evui-timepicker-spinner-item.active,
  .evui-timepicker-spinner-list .evui-timepicker-spinner-item.active:hover {
    background-color: #41B883;
    color: #FFFFFF;
  }
</style>
