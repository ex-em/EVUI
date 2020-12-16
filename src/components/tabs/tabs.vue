<template>
  <div class="ev-tabs">
    <div class="ev-tabs-header">
      <div
        :class="{'ev-tabs-scroll': true, 'scrollable': isActiveScroll}"
      >
        <span
          v-show="isActiveScroll"
          :class="{'ev-tab-scroll-icon': true, 'disabled': disablePrev}"
          style="left: 0;"
          @click="onMoveScroll('left')"
        >
          <ev-icon
            :cls="'ei-s ei-arrow-left'"
            style="font-size: 12px;"
          />
        </span>
        <span
          v-show="isActiveScroll"
          :class="{'ev-tab-scroll-icon': true, 'disabled': disableNext}"
          style="right: 0;"
          @click="onMoveScroll('right')"
        >
          <ev-icon
            :cls="'ei-s ei-arrow-right'"
            style="font-size: 12px;"
          />
        </span>
        <div
          ref="navWrap"
          class="ev-tabs-nav-wrap"
          @mousewheel.prevent="onMouseWheel"
        >
          <div
            ref="nav"
            :style="translate"
            class="ev-tabs-nav"
          >
            <!-- eslint-disable max-len -->
            <div
              v-for="tab in tabList"
              :key="tab.value"
              :value="tab.value"
              :class="{'ev-tabs-item': true, 'active': tab.value === activeTab, 'dragover': tab.value === dragOverValue}"
              :style="`min-width: ${minTabWidth}px;`"
              :draggable="true"
              @click="changeTab(tab.value)"
              @dragstart="onDragStart($event, tab.value)"
              @dragover.prevent="onDragOver($event, tab.value)"
              @dragend.prevent="onDragEnd"
            >
              <span
                :style="`font-size: ${titleSize}px;`"
                class="ev-tabs-item-content"
              >
                <ev-icon
                  v-if="tab.icon"
                  :class="tab.icon"
                  style="margin-right: 3px; font-size: 12px;"
                />
                {{ tab.title }}
                <ev-icon
                  v-if="!disableRemoveTab && tabList.length > 1"
                  class="ei-close ev-tab-close-btn"
                  style="margin-left: 3px; font-size: 12px;"
                  @click.native.stop="removeTab(tab.value)"
                />
              </span>
            </div>
            <!-- eslint-enable -->
          </div>
        </div>
      </div>
    </div>
    <div class="ev-tabs-body">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      /**
       * 탭 목록
       */
      value: {
        type: Array,
        default() {
          return [];
        },
      },
      /**
       * 탭 이동 가능 유무
       */
      disableMoveTab: {
        type: Boolean,
        default: false,
      },
      /**
       * 탭 제거 가능 유무
       */
      disableRemoveTab: {
        type: Boolean,
        default: false,
      },
      /**
       * 탭 헤더 너비
       */
      minTabWidth: {
        type: Number,
        default: 100,
      },
      /**
       * 탭 제목 글자 크기
       */
      titleSize: {
        type: Number,
        default: 16,
      },
      /**
       * 탭 활성화 키값
       */
      activeTabValue: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        tabList: this.value.slice(),
        activeTab: this.activeTabValue,
        currentOffset: 0,
        isActiveScroll: false,
        disablePrev: true,
        disableNext: false,
        dragStartValue: '',
        dragOverValue: '',
      };
    },
    computed: {
      translate() {
        return `transform: translateX(${this.currentOffset}px);`;
      },
    },
    watch: {
      value(value) {
        if (this.tabList.length < value.length) {
          const addValue = value[value.length - 1].value;

          this.tabList = value.slice();
          this.$emit('change-tab', this.activeTab, addValue);
          this.activeTab = addValue;
        } else {
          this.tabList = value.slice();
        }

        setTimeout(() => this.toggleScrollIcon());
      },
      activeTabValue(value) {
        if (this.checkValid(value)) {
          this.activeTab = value;
          setTimeout(() => this.toggleScrollIcon());
        }
      },
    },
    mounted() {
      if (!this.checkValid(this.activeTab) && this.tabList.length) {
        this.activeTab = this.tabList[0].value;
      }

      setTimeout(() => this.toggleScrollIcon());
    },
    methods: {
      /**
       * 해당 키값을 가진 탭이 존재하는지 확인한다.
       *
       * @param {string} value - 탭의 키값
       * @returns {boolean} 탭 존재 유무
       */
      checkValid(value) {
        let isExist = false;

        for (let ix = 0; ix < this.tabList.length; ix++) {
          if (this.tabList[ix].value === value) {
            isExist = true;
            break;
          }
        }

        return isExist;
      },
      /**
       * dragstart 이벤트를 처리한다.
       *
       * @param {object} e - 이벤트 객체
       * @param {string} value - 탭의 키값
       */
      onDragStart(e, value) {
        if (this.disableMoveTab) {
          return;
        }

        e.dataTransfer.effectAllowed = 'move';
        this.dragStartValue = value;
      },
      /**
       * dragover 이벤트를 처리한다.
       *
       * @param {object} e - 이벤트 객체
       * @param {string} value - 탭의 키값
       */
      onDragOver(e, value) {
        if (this.disableMoveTab) {
          return;
        }

        e.dataTransfer.dropEffect = 'move';
        this.dragOverValue = value;
      },
      /**
       * dragend 이벤트를 처리한다.
       */
      onDragEnd() {
        let dragIndex;
        let moveIndex;
        let dragInfo;
        let moveInfo;
        let tabInfo;

        if (this.disableMoveTab) {
          return;
        }

        for (let ix = 0; ix < this.tabList.length; ix++) {
          tabInfo = this.tabList[ix];
          if (tabInfo.value === this.dragOverValue) {
            moveIndex = ix;
            moveInfo = tabInfo;
          } else if (tabInfo.value === this.dragStartValue) {
            dragIndex = ix;
            dragInfo = tabInfo;
          }
        }

        if (dragInfo && moveInfo) {
          this.$set(this.tabList, moveIndex, dragInfo);
          this.$set(this.tabList, dragIndex, moveInfo);
          this.$emit('input', this.tabList);
        }

        this.dragStartValue = '';
        this.dragOverValue = '';
      },
      /**
       * mousewheel 이벤트를 처리한다.
       *
       * @param {object} e - 이벤트 객체
       */
      onMouseWheel(e) {
        if (this.isActiveScroll) {
          if (e.deltaY < 0) {
            this.onMoveScroll('left');
          } else if (e.deltaY > 0) {
            this.onMoveScroll('right');
          }
        }
      },
      /**
       * scroll 이벤트를 처리한다.
       *
       * @param {string} type - 이동 방향
       */
      onMoveScroll(type) {
        const currentOffset = this.currentOffset;
        const minTabWidth = this.minTabWidth;
        const navWidth = this.$refs.nav.offsetWidth;
        const navWrapWidth = this.$refs.navWrap.offsetWidth;
        const maxOffset = navWidth - navWrapWidth;

        if (type === 'left' && currentOffset !== 0) {
          if (currentOffset + minTabWidth > 0) {
            this.currentOffset = 0;
            this.disablePrev = true;
          } else {
            this.currentOffset += minTabWidth;
            this.disablePrev = false;
            this.disableNext = false;
          }
        } else if (type === 'right' && currentOffset !== -maxOffset) {
          if (currentOffset - minTabWidth < -maxOffset) {
            this.currentOffset -= maxOffset - Math.abs(currentOffset);
            this.disableNext = true;
          } else {
            this.currentOffset -= minTabWidth;
            this.disablePrev = false;
            this.disableNext = false;
          }
        }
      },
      /**
       * tab scroll icon 표시 유무를 처리한다.
       */
      toggleScrollIcon() {
        const navWidth = this.$refs.nav.offsetWidth;
        const navWrapWidth = this.$refs.navWrap.offsetWidth;

        if (navWrapWidth && navWidth) {
          if (!this.isActiveScroll && navWrapWidth < navWidth) {
            this.isActiveScroll = true;
          } else if (this.isActiveScroll && navWrapWidth >= navWidth) {
            this.moveToScroll();
            this.isActiveScroll = false;
          }
        }

        if (this.isActiveScroll) {
          this.moveToScroll();
        }
      },
      /**
       * tab scroll 관련 offset 계산하여 적용한다.
       */
      moveToScroll() {
        setTimeout(() => {
          const nav = this.$refs.nav;
          const navRect = nav.getBoundingClientRect();
          const navWrapWidth = this.$refs.navWrap.offsetWidth;
          const activeTabRect = nav.querySelector(`div[value='${this.activeTab}']`).getBoundingClientRect();
          const activeTabWidth = (activeTabRect.left + activeTabRect.width) - navRect.left;
          let moveOffset = navWrapWidth - activeTabWidth;
          const maxMoveOffset = navRect.width - navWrapWidth;

          if (this.tabList[this.tabList.length - 1].value !== this.activeTab) {
            moveOffset += 4;
          }

          this.currentOffset = moveOffset > 0 ? 0 : moveOffset;
          if (this.currentOffset) {
            this.disablePrev = false;
            this.disableNext = Math.abs(this.currentOffset) === maxMoveOffset;
          } else {
            this.disablePrev = true;
            this.disableNext = false;
          }
        });
      },
      /**
       * 탭 변경에 대해서 치리한다.
       *
       * @param {string} value - 탭의 키값
       */
      changeTab(value) {
        if (this.activeTab === value) {
          return;
        }

        /**
         * 탭 변경 이벤트
         *
         * @property {string} oldTab - 이전 탭 키값
         * @property {string} newTab - 현재 탭 키값
         */
        this.$emit('change-tab', this.activeTab, value);
        this.activeTab = value;
      },
      /**
       * 탭 제거에 대해서 처리한다.
       *
       * @param {string} value - 탭의 키값
       */
      removeTab(value) {
        let removeIndex;
        let removeTab;

        if (this.tabList.length === 1) {
          return;
        }

        for (let ix = 0; ix < this.tabList.length; ix++) {
          if (this.tabList[ix].value === value) {
            removeTab = this.tabList[ix];
            removeIndex = ix;
            this.tabList.splice(ix, 1);
            break;
          }
        }

        if (this.activeTab === value) {
          removeIndex = this.tabList.length === removeIndex ? removeIndex - 1 : removeIndex;
          this.activeTab = this.tabList[removeIndex].value;
          /**
           * 탭 변경 이벤트
           *
           * @property {string} oldTab - 이전 탭 키값
           * @property {string} newTab - 현재 탭 키값
           */
          this.$emit('change-tab', value, this.activeTab);
        }

        /**
         * 탭 제거 이벤트
         *
         * @property {string} removeTab - 제거된 탭 키값
         */
        this.$emit('remove-tab', removeTab);
        this.$emit('input', this.tabList);
        setTimeout(() => this.toggleScrollIcon());
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-tabs {
    width: 100%;
    height: 100%;
    padding-top: 36px;
    position: relative;
  }
  .ev-tabs-header {
    position: absolute;
    padding: 0;
    top: 0;
    width: 100%;
    height: 36px;

    @include evThemify() {
      border-bottom: $border-solid evThemed('tab-border');
    }
  }
  .ev-tabs-body {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;

    @include evThemify() {
      color: evThemed('font-color-base');
      border: $border-solid evThemed('tab-border');
      background-color: evThemed('tab-active-bg');
      border-top: 0;
    }
  }
  .ev-tabs-scroll {
    box-sizing: border-box;
    overflow: hidden;
    margin-bottom: -1px;
    position: relative;

    &.scrollable {
      padding: 0 15px;
    }
  }
  .ev-tabs-nav-wrap {
    overflow: hidden;
  }
  .ev-tabs-nav {
    box-sizing: border-box;
    white-space: nowrap;
    position: relative;
    transition: transform .3s;
    float: left;
  }
  .ev-tabs-item {
    position: relative;
    display: inline-block;
    height: 36px;
    box-sizing: border-box;
    user-select: none;
    cursor: pointer;
    border-radius: 2px;

    @include evThemify() {
      color: evThemed('tab-color');
      border: $border-solid evThemed('tab-border');
      background-color: evThemed('tab-bg');
    }

    &.active {
      transform: translateZ(0);
      border-bottom: none;

      @include evThemify() {
        color: evThemed('tab-color');
        background-color: evThemed('tab-active-bg');
      }

      & .ev-tabs-item-content {
        @include evThemify() {
          color: evThemed('tab-color');
        }
      }
    }

    &.dragover {
      border-left: 3px solid blue;
    }

    &:not(:last-child) {
      margin-right: 4px;
    }
  }
  .ev-tabs-item-content {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 36px;
    text-align: center;
    padding: 0 5px;

    @include evThemify() {
      color: rgba(evThemed('tab-color'), 0.7);
    }

    & .ev-tab-close-btn {
      width: 12px;

      &:hover {
        font-weight: bold;
        color: red;
      }
    }
  }
  .ev-tab-scroll-icon {
    position: absolute;
    line-height: 36px;
    cursor: pointer;

    @include evThemify() {
      border: $border-solid evThemed('tab-border');
    }

    &.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
</style>
