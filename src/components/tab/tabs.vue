<template>
  <div class="tabs-outer">
    <div
      v-if="showTabTitle"
      class="tabs-title-outer"
    >
      <div class="tabs-title">
        <ul class="tab-list">
          <tab
            v-for="(tab, index) in tabs"
            :key="index"
            :tab-data="tab"
            @close="close"
            @set-active="setActive"
          />
        </ul>
      </div>
    </div>
    <div
      class="tab-content"
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
  import draggable from 'vuedraggable';
  import tab from './tab';
  import tabContent from './tab.content';

  const unpackNode = function unpackNode(node) {
    let data = null;
    if (node.tag !== undefined) {
      data = node.componentOptions.propsData.tabData;
    }
    return data;
  };
  export default {
    components: {
      tab,
      tabContent,
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
      tabList: {
        type: Array,
        default() {
          return [];
        },
      },
    },
    data() {
      return {
        originTabList: this.tabList,
        tabs: this.createTabData(),
        currentTab: {
          isActive: false,
        },
        idTag: 0,
        tabLength: 0,
        renderedComponentList: {},
        renderedComponent: {
          id: null,
          keyName: null,
        },
      };
    },
    watch: {
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
          this.idTag += 1;
          this.tabLength += 1;
        }
      },
    },
    mounted() {
      this.idTag = Number(this.tabs.length);
      this.tabLength = Number(this.originTabList.length);
      this.tabs = this.tabs.map(v => this.renderTabList(v));
      this.setActive(this.tabs[0]);
    },
    methods: {
      renderTabList(data) {
        const target = data.targetComponent;
        if (target) {
          if (!this.renderedComponentList[target]) {
            this.$Vue.component(target.keyName, target.component);
            this.renderedComponentList[target.keyName] = true;
          }
        }
        return data;
      },
      renderTab(data) {
        const target = data.targetComponent;
        if (target) {
          if (!this.renderedComponentList[target]) {
            this.$Vue.component(target.keyName, target.component);
            this.renderedComponentList[target.keyName] = true;
            this.renderedComponent = {
              keyName: target.keyName,
              id: data.id,
            };
          } else {
            this.renderedComponent = {
              keyName: null,
              id: null,
            };
          }
        }
        return data;
      },
      createTabData() {
        const slotList = [];
        let result = [];

        if (this.$slots.default && this.$slots.default.length > 0) {
          let index = 0;
          let length = this.$slots.default.length;
          while (length--) {
            const item = unpackNode(this.$slots.default[index], 'tab');
            if (item !== null) {
              slotList.push(item);
            }
            index++;
          }
        }

        result.push(slotList);
        result.push(this.tabList);
        result = result.reduce((acc, curr) => {
          const val = this.orderingSlotFirst ? [].concat(acc, curr) : [].concat(curr, acc);
          return val;
        });

        for (let i = 0, length = result.length; i < length; i++) {
          const obj = {};
          obj.id = `${this._uid}_tab_${i}`;
          if (result[i].targetComponent) {
            result[i].targetComponent.uid = obj.id;
          }
          Object.assign(result[i], obj);
        }
        return result;
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
              this.setActive(result[0]);
            }
            break;
          }
        }
      },
      checkAppendedTag() {
        return this.tabLength < this.originTabList.length;
      },
    },
  };
</script>

<style scoped>
  .tabs-outer {
    width: 100%;
    height: inherit;
    user-select: none;
  }
  .tabs-title {
    display: inline-block;
  }
  .tab-list {
    list-style-type: none;
    overflow: hidden;
  }
  .tabs-title-outer {
    width: 100%;
    height: 38px;
  }
  .tab-content {
    height: inherit;
    border: 1px solid #CBD3EA;
    border-top: 1px solid #CBD3EA;
  }
</style>
