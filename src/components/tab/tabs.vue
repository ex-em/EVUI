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
        >
          <span
            v-if="tabScroll"
            class="ev-tabs-nav-prev"
            @click.stop="onLeftMove"
          >
            <icon class="fa-angle-left"/>
          </span>
          <span
            v-if="tabScroll"
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
              :style="styleObj"
              class="ev-tabs-nav"
            >
              <tab
                v-for="(tab, index) in tabs"
                :key="index"
                :tab-prop="tab"
                :min-width="defaultTabWidth"
                @close="close"
                @set-active="setActive"
                @drag-start="onDragStart"
                @drag-end="onDragEnd"
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
  import draggable from 'vuedraggable';
  import tab from './tab';

  const unpackNode = function unpackNode(node) {
    let data = null;
    if (node.tag !== undefined) {
      data = node.componentOptions.propsData.tabProp;
    }
    return data;
  };
  export default {
    components: {
      icon,
      tab,
      draggable,
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
    },
    data() {
      return {
        tabScroll: this.scrollable,
        originTabList: this.tabData,
        tabs: this.createTabData(),
        currentTab: {
          isActive: false,
        },
        idTag: 0,
        tabLength: 0,
        defaultTabWidth: 100,
        renderedComponentList: {},
        renderedComponent: {
          id: null,
          keyName: null,
        },
        tabListRect: null,
        tabWrapperRect: null,
        styleObj: 'transform: \'\'',
        currentX: 0,
      };
    },
    computed: {
      showScrollable() {
        return [{
          active: this.tabScroll,
        }];
      },
      getTranslateX() {
        return [];
      },
    },
    watch: {
      styleObj() {
        console.log(this.styleObj);
      },
      currentTab() {
        this.currentTab.isActive = true;
      },
      originTabList() {
        if (this.checkAppendedTag()) {
          const obj = {
            id: `${this._uid}_tab_${this.idTag}`,
          };

          const tabItem = Object.assign({}, this.originTabList[this.originTabList.length - 1], obj);

          this.tabs.push(tabItem);
          this.setActive(tabItem);
          this.idTag += 1;
          this.tabLength += 1;
          this.setTabListWidth('added');
        }
      },
    },
    mounted() {
      this.idTag = Number(this.tabs.length);
      this.tabLength = Number(this.originTabList.length);

      this.tabs = this.tabs.map((v) => {
        const target = v.targetComponent;
        this.installComponent(target);
        return v;
      });
      this.setActive(this.tabs[this.tabs.length - 1]);
      this.setTabListWidth();
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
        for (let i = 0, length = this.tabs.length; i < length; i++) {
          const obj = { isActive: false };
          if (this.tabs[i].id === data.id) {
            obj.isActive = true;
            this.currentTab = this.tabs[i];
            this.renderTab(data);
          }
          this.tabs[i].isActive = obj.isActive;
        }
      },
      close(data) {
        this.removeTabTarget(data);
        this.setTabListWidth('removal');
      },
      removeTabTarget(data) {
        if (this.tabs.length === 1) {
          console.log('last one!');
          return;
        }
        const result = this.tabs;
        for (let i = 0, length = result.length; i < length; i++) {
          if (this.tabs[i].id === data.id) {
            result.splice(i, 1);
            this.tabLength -= 1;
            if (data.isActive) {
              this.setActive(result[result.length - 1]);
            }
            break;
          }
        }
      },
      checkAppendedTag() {
        return this.tabLength < this.originTabList.length;
      },
      onDragStart() {
      },
      onDragEnd() {
      },
      onLeftMove(e) {
        if (this.currentX === 0) {
          console.log('don\'t move');
          return;
        }
        this.onChangeTransForm(e, 'left');
      },
      onRightMove(e) {
        if (this.currentX > this.tabWrapperRect.width) {
          console.log('don\'t move');
          return;
        }
        this.onChangeTransForm(e, 'right');
      },
      onChangeTransForm(e, type) {
        const moveInterval = this.tabWrapperRect.width * 0.1;
        if (type === 'left') {
          this.currentX += moveInterval;
        } else if (type === 'right') {
          this.currentX -= moveInterval;
        }
        this.styleObj = `transform: translateX(${this.currentX}px);`;
      },
      setTranslatePosition(type) {
        if (type === 'added') {
          this.currentX -= this.tabWrapperRect.width * 0.1;
        }
        this.styleObj = `transform: translateX(${this.currentX}px);`;
      },
      setTabListWidth(type) {
        this.$nextTick(() => {
          this.tabWrapperRect = this.$refs.tabListWrapperRef.getBoundingClientRect();
          this.tabListRect = this.$refs.tabListRef.getBoundingClientRect();
          if (this.tabWrapperRect.width < this.tabListRect.width + 20) {
            this.tabScroll = true;
          } else {
            this.tabScroll = false;
          }

          if (this.tabScroll) {
            this.setTranslatePosition(type);
          }
        });
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
</style>
