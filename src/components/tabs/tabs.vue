<template>
  <div class="ev-tabs">
    <div
      class="ev-tabs-header"
    >
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
              @mouseenter="toggleCloseIcon($event, true)"
              @mouseleave="toggleCloseIcon($event, false)"
              @dragstart="onDragStart($event, tab.value)"
              @dragover.prevent="onDragOver($event, tab.value)"
              @dragend.prevent="onDragEnd"
            >
              <span
                class="ev-tabs-item-content"
              >
                {{ tab.title }}
                <ev-icon
                  v-if="!disableRemoveTab"
                  class="ei-close ev-tab-close-btn"
                  style="margin-left: 3px; font-size: 10px;"
                  @click.native.stop="removeTab(tab.value)"
                />
              </span>
            </div>
            <!-- eslint-enable -->
          </div>
        </div>
      </div>
    </div>
    <div
      class="ev-tabs-body"
      style="width: 100%; height: 100%"
    >
      <slot/>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        type: Array,
        default() {
          return [];
        },
      },
      disableMoveTab: {
        type: Boolean,
        default: false,
      },
      disableRemoveTab: {
        type: Boolean,
        default: false,
      },
      minTabWidth: {
        type: Number,
        default: 100,
      },
      activeTabValue: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        tabList: this.value,
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
      activeTabValue(value) {
        if (this.checkValid(value)) {
          this.activeTab = value;
          this.toggleScrollIcon();
        }
      },
      value(value) {
        this.tabList = value;
        setTimeout(() => this.toggleScrollIcon());
      },
    },
    created() {
    },
    mounted() {
      if (!this.checkValid(this.activeTab) && this.tabList.length) {
        this.activeTab = this.tabList[0].value;
        this.toggleScrollIcon();
      }
    },
    methods: {
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
      onDragStart(e, value) {
        if (this.disableMoveTab) {
          return;
        }

        e.dataTransfer.effectAllowed = 'move';
        this.dragStartValue = value;
      },
      onDragOver(e, value) {
        if (this.disableMoveTab) {
          return;
        }

        e.dataTransfer.dropEffect = 'move';
        this.dragOverValue = value;
      },
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
      onMouseWheel(e) {
        if (this.isActiveScroll) {
          if (e.deltaY < 0) {
            this.onMoveScroll('left');
          } else if (e.deltaY > 0) {
            this.onMoveScroll('right');
          }
        }
      },
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
      moveToScroll() {
        setTimeout(() => {
          const nav = this.$refs.nav;
          const navRect = nav.getBoundingClientRect();
          const navWrapWidth = this.$refs.navWrap.offsetWidth;
          const activeTabRect = nav.querySelector(`div[value='${this.activeTab}']`).getBoundingClientRect();
          const activeTabWidth = (activeTabRect.left + activeTabRect.width) - navRect.left;
          const moveOffset = navWrapWidth - (activeTabWidth + 4);
          const maxMoveOffset = navRect.width - navWrapWidth;

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
      toggleCloseIcon(e, value) {
        if (this.disableRemoveTab) {
          return;
        }

        const itemContent = e.target.getElementsByClassName('ev-tabs-item-content')[0];
        if (value) {
          itemContent.classList.add('icon');
        } else {
          itemContent.classList.remove('icon');
        }
      },
      changeTab(value) {
        if (this.activeTab === value) {
          return;
        }

        this.$emit('change-tab', this.activeTab, value);
        this.activeTab = value;
      },
      removeTab(value) {
        let removeIndex;

        if (this.tabList.length === 1) {
          return;
        }

        for (let ix = 0; ix < this.tabList.length; ix++) {
          if (this.tabList[ix].value === value) {
            this.tabList.splice(ix, 1);
            removeIndex = ix;
            break;
          }
        }

        if (this.activeTab === value) {
          removeIndex = this.tabList.length === removeIndex ? removeIndex - 1 : removeIndex;
          this.activeTab = this.tabList[removeIndex].value;
          this.$emit('change-tab', value, this.activeTab);
        }

        this.$emit('input', this.tabList);
        setTimeout(() => this.toggleScrollIcon());
      },
    },
  };
</script>

<style>
  .ev-tabs {
    width: 100%;
    height: 100%;
    padding-top: 30px;
  }
  .ev-tabs-header {
    position: absolute;
    padding: 0;
    top: 0;
    width: 100%;
    height: 30px;
    border-bottom: 1px solid #dddee1;
  }
  .ev-tabs-body {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid #dddee1;
    border-top: 0;
  }
  .ev-tabs-scroll {
    box-sizing: border-box;
    overflow: hidden;
    margin-bottom: -1px;
    position: relative;
  }
  .ev-tabs-scroll.scrollable {
    padding: 0 15px;
  }
  .ev-tabs-nav-wrap {
    overflow: hidden;
  }
  .ev-tabs-nav {
    border: 1px solid #dddee1;
    border-bottom: none;
    border-top: none;
    border-radius: 4px 4px 0 0;
    box-sizing: border-box;
    white-space: nowrap;
    position: relative;
    transition: transform .3s;
    float: left;
  }
  .ev-tabs-nav:first-child {
    border-left: none;
  }
  .ev-tabs-nav:last-child {
    border-right: none;
  }
  .ev-tabs-item {
    margin-right: 4px;
    height: 30px;
    box-sizing: border-box;
    display: inline-block;
    font-size: 12px;
    font-weight: 500;
    color: #303133;
    position: relative;
    background: #f8f8f9;
    border: 1px solid #dddee1;
    user-select: none;
  }
  .ev-tabs-item.active {
    background: #fff;
    transform: translateZ(0);
    color: #2d8cf0;
    border-bottom: none;
  }
  .ev-tabs-item:hover {
    color: #2589E9;
    font-weight: bold;
    cursor: pointer;
  }
  .ev-tabs-item.dragover {
    border-left: 3px solid blue;
  }
  .ev-tab-close-btn {
    width: 0;
    overflow: hidden;
    font-weight: normal;
  }
  .ev-tabs-item > .icon > .ev-tab-close-btn {
    width: 10px;
  }
  .ev-tab-close-btn:hover {
    font-weight: bold;
    color: red;
  }
  .ev-tabs-item-content {
    display: flex;
    align-items: baseline;
    justify-content: center;
    padding: 5px 16px 4px;
    font-size: 14px;
  }
  .ev-tab-scroll-icon {
    position: absolute;
    line-height: 30px;
    cursor: pointer;
  }
  .ev-tab-scroll-icon.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
