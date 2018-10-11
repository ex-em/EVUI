<template>
  <div
    class="ev-tabs ev-tabs-outer"
  >
    <div
      v-if="showTabTitle"
      class="ev-tabs-title-bar"
    >
      <div
        class="ev-tabs-nav-container"
      >
        <div
          :class="showScrollable"
          class="ev-tabs-nav-wrap ev-tabs-nav-scrollable"
          @mousewheel="wheelEvent"
        >
          <span
            v-if="useTabScroll"
            class="ev-tabs-nav-prev"
            @click.stop="onLeftMove"
          >
            <icon class="fa-angle-left"/>
          </span>
          <span
            v-if="useTabScroll"
            class="ev-tabs-nav-next"
            @click.stop="onRightMove"
          >
            <icon class="fa-angle-right"/>
          </span>
          <div
            ref="tabListWrapperRef"
            class="ev-tab-list-scroll"
          >
            <div
              ref="tabListRef"
              :style="moveTranslateX"
              class="ev-tabs-nav"
            >
              <tab
                v-for="(tab, index) in currentTabList"
                ref="tabItemRef"
                :key="index"
                :tab-prop="tab"
                :tab-index="tab.id"
                :min-width="defaultTabWidth"
                draggable="true"
                @close="close"
                @set-active="setActive"
                @drag-start="onDragStart($event, tab, index)"
                @drag-end="onDragEnd($event, tab, index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="ev-tab-content-container"
    >
      <keep-alive>
        <component
          :is="renderedComponent.keyName"
          :key="renderedComponent.id"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script>
  import icon from '@/components/icon/icon';
  import tab from './tab';

  const unpackNode = function unpackNode(node) {
    let data = null;
    const tagNameRxg = new RegExp(/(tab)+/g);
    if (node.tag && node.tag.match(tagNameRxg).length > 0) {
      data = node.componentOptions.propsData.tabProp;
    }
    return data;
  };
  export default {
    components: {
      icon,
      tab,
    },
    props: {
      orderingSlotFirst: {
        type: Boolean,
        default: true,
      },
      showTabTitle: {
        type: Boolean,
        default: true,
      },
      tabData: {
        type: Array,
        default() {
          return [];
        },
      },
      scrollable: {
        type: Boolean,
        default: false,
      },
      useFlexibleScroll: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        idTag: 0,
        tabCount: 0,
        defaultTabWidth: 100,
        currentX: 0,
        renderedComponentList: {},
        tabListRect: null,
        tabWrapperRect: null,
        currentTab: {
          isActive: false,
        },
        renderedComponent: {
          id: null,
          keyName: null,
        },
        moveTranslateX: 'transform: \'\'',
        originTabList: this.tabData,
        useTabScroll: this.scrollable,
        currentTabList: this.createTabData(),
        indicator: 0,
        currentTabIndex: 0,
      };
    },
    computed: {
      showScrollable() {
        return [{
          active: this.useTabScroll,
        }];
      },
    },
    watch: {
      currentTab() {
        this.currentTab.isActive = true;
      },
      originTabList() {
        if (this.tabCount < this.originTabList.length) {
          const obj = {
            id: `${this._uid}_tab_${this.idTag}`,
          };
          const tabItem = Object.assign({}, this.originTabList[this.originTabList.length - 1], obj);
          this.currentTabList.push(tabItem);
          this.setActive(tabItem);
          this.idTag += 1;
          this.tabCount += 1;
          this.setScrollIcon(tabItem, 'add');
        }
      },
    },
    mounted() {
      this.idTag = Number(this.currentTabList.length);
      this.tabCount = Number(this.originTabList.length);
      this.currentTabList.forEach((v) => {
        const target = v.targetComponent;
        this.installComponent(target);
      });
      this.setActive(this.currentTabList[this.currentTabList.length - 1]);
      this.setScrollIcon();
      this.initIndicator();
    },
    methods: {
      renderTab(data) {
        const target = data.targetComponent;

        this.renderedComponent = {
          keyName: null,
          id: null,
        };

        if (this.installComponent(target)) {
          this.renderedComponent = {
            keyName: target.keyName,
            id: data.id,
          };
        }
        return data;
      },
      installComponent(target) {
        let installed = false;
        if (target) {
          if (!this.renderedComponentList[target]) {
            this.$Vue.component(target.keyName, target.component);
            this.renderedComponentList[target.keyName] = true;
          }
          installed = true;
        }
        return installed;
      },
      createTabData() {
        let result = [];
        const slotList = this.getSlotList(this.$slots.default);

        result = result.concat(slotList, this.tabData).reduce((acc, curr) => {
          const val = this.orderingSlotFirst ? [].concat(acc, curr) : [].concat(curr, acc);
          return val;
        });

        for (let i = 0, length = result.length; i < length; i++) {
          this.appendTabId(result[i], i);
        }

        return result;
      },
      appendTabId(data, index) {
        const obj = {};
        const item = data;

        obj.id = `${this._uid}_tab_${index}`;

        if (item.targetComponent) {
          item.targetComponent.uid = obj.id;
        }
        Object.assign(item, obj);

        return item;
      },
      getSlotList(slots) {
        const slotList = [];

        if (slots && slots.length > 0) {
          let index = 0;
          let length = slots.length;
          while (length--) {
            const item = unpackNode(slots[index], 'tab');
            if (item !== null) {
              slotList.push(item);
            }
            index++;
          }
        }

        return slotList;
      },
      setActive(data) {
        for (let i = 0, length = this.currentTabList.length; i < length; i++) {
          const obj = { isActive: false };
          if (this.currentTabList[i].id === data.id) {
            obj.isActive = true;
            this.currentTab = this.currentTabList[i];
            this.renderTab(data);
          }
          this.currentTabList[i].isActive = obj.isActive;
        }
      },
      close(data) {
        this.removeTabTarget(data);
        this.setScrollIcon(data, 'removal');
      },
      removeTabTarget(data) {
        if (this.currentTabList.length === 1) {
          return;
        }
        const result = this.currentTabList;
        for (let i = 0, length = result.length; i < length; i++) {
          if (this.currentTabList[i].id === data.id) {
            result.splice(i, 1);
            this.tabCount -= 1;
            if (data.isActive) {
              this.setActive(result[result.length - 1]);
            }
            break;
          }
        }
      },
      onDragStart(event, data, index) {
        console.log(event, data, index);
      },
      onDragEnd(event, data, index) {
        console.log(event, data, index);
      },
      wheelEvent(e) {
        e.preventDefault();
        if (!this.useTabScroll) {
          return;
        }
        if (e.wheelDeltaY === 120) {
          this.onLeftMove(e);
        } else if (e.wheelDeltaY === -120) {
          this.onRightMove(e);
        }
      },
      onLeftMove(e) {
        if (this.currentX > -100) {
          this.currentX = 0;
          this.moveTranslateX = `transform: translateX(${this.currentX}px);`;
          return;
        }
        this.onChangeTransForm(e, 'left');
      },
      onRightMove(e) {
        const tabItemRef = this.$refs.tabItemRef;
        const tabItemEl = tabItemRef[0].$el.getBoundingClientRect();
        const tabItemX = tabItemRef[tabItemRef.length - 1].$el.getBoundingClientRect().x;
        const wrapperWidth = this.$refs.tabListWrapperRef.getBoundingClientRect().width;
        if (Math.abs(wrapperWidth - tabItemX) < tabItemEl.width) {
          return;
        }
        this.onChangeTransForm(e, 'right');
      },
      onChangeTransForm(e, type) {
        const tabItemRef = this.$refs.tabItemRef;
        const tabItemEl = tabItemRef[0].$el.getBoundingClientRect();
        if (type === 'left') {
          this.currentX += ((tabItemEl.width) + 4);
        } else if (type === 'right') {
          this.currentX -= ((tabItemEl.width) + 4);
        }
        this.moveTranslateX = `transform: translateX(${this.currentX}px);`;
      },
      setTransForm(data, type, init) {
        const tabItemRef = this.$refs.tabItemRef;
        const tabItemEl = tabItemRef[0].$el.getBoundingClientRect();
        if (type === 'add') {
          if (init) {
            this.currentX -= 25;
          } else {
            this.currentX -= ((tabItemEl.width) + 4);
          }
        } else if (type === 'removal') {
          this.currentX += ((tabItemEl.width) + 4);
        } else if (type === 'deleteScroll') {
          this.currentX = 0;
        }
        this.moveTranslateX = `transform: translateX(${this.currentX}px);`;
      },
      setScrollIcon(data, type) {
        const sideIconWidth = 20;
        this.$nextTick(() => {
          this.tabWrapperRect = this.$refs.tabListWrapperRef.getBoundingClientRect();
          this.tabListRect = this.$refs.tabListRef.getBoundingClientRect();
          if (this.tabWrapperRect.width < this.tabListRect.width + sideIconWidth) {
            this.useTabScroll = true;
            if (!this.initScroll) {
              this.initScroll = true;
              this.setTransForm(data, type, this.initScroll);
            } else {
              this.setTransForm(data, type);
            }
          } else {
            this.useTabScroll = false;
            if (this.initScroll) {
              this.initScroll = false;
              this.setTransForm(data, 'deleteScroll');
            }
          }
        });
      },
      initIndicator() {
        this.indicator = 0;
        this.max = this.tabWrapperRect;
        const tabItemRef = this.$refs.tabItemRef;
        const totalWidth = tabItemRef.map(v => v.$el.getBoundingClientRect().width)
          .reduce((acc, curr) => acc + curr);
        console.log(totalWidth);
        this.tabWrapperRect = this.$refs.tabListWrapperRef.getBoundingClientRect();
        this.tabListRect = this.$refs.tabListRef.getBoundingClientRect();
        console.log(this.tabListRect.width, this.tabWrapperRect.width);
      },
      getTabItems() {
        return this.$refs.tabItemRef;
      },
      setIndicator() {
        // this.max = this.tabWrapperRect;
        // this.indicator += width;
        // if (this.indicator >= this.max) {
        //   this.indicator = this.max;
        // } else if (this.indicator <= 0) {
        //   this.indicator = 0;
        // }
      },
    },
  };
</script>

<style scoped>
  .ev-tabs {
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    color: #495060;
    zoom: 1;
  }
  .ev-tabs-outer {
  }
  .ev-tabs-title-bar {
    outline: none;
    border-bottom: 1px solid #dddee1;
  }
  .ev-tabs-nav-container {
    margin-bottom: -1px;
    line-height: 1.5;
    font-size: 14px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    zoom: 1;
  }
  .ev-tabs-nav-wrap {
    overflow: hidden;
    margin-bottom: 0;
  }
  .ev-tabs-nav-scrollable {
    padding: 0;
  }
  .ev-tabs-nav-next {
    position: absolute;
    line-height: 32px;
    right: 0;
    cursor: pointer;
  }
  .ev-tabs-nav-prev {
    position: absolute;
    line-height: 32px;
    left: 0;
    cursor: pointer;
  }
  .ev-tab-list-scroll {
    overflow: hidden;
  }
  .ev-tabs-nav {
    padding-left: 0;
    margin: 0;
    float: left;
    list-style: none;
    box-sizing: border-box;
    position: relative;
    transition: transform 0.5s ease-in-out;
    display: inline-block;
  }

  .ev-tab-content-container {
    border: 1px solid #dddee1;
    border-top: 0;
    padding: 3px;
    display: flex;
    flex-direction: row;
  }
  .ev-tabs-nav-scrollable.active {
    padding: 0 12px;
  }

  .ev-tabs-nav-container:before, .ev-tabs-nav-container:after {
    content: "";
    display: table;
  }

  .ev-tabs:before, .ev-tabs:after {
    content: "";
    display: table;
    clear: both;
    visibility: hidden;
    font-size: 0;
    height: 0;
  }
  .ev-tabs-nav-next:hover, .ev-tabs-nav-prev:hover {
    color: #2d8cf0;
  }
  .ev-indicator {
    display: inline-block;
  }
</style>
