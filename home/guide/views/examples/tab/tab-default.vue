<template>
  <div class="outer">
    <div class="button-outer">
      <ev-button
        :type="'primary'"
        :text="'Tab Add'"
        @click="addTab"
      />
    </div>
    <div class="tab-default-outer">
      <ev-tabs
        :tab-data="list"
      >
        <ev-tab
          :tab-prop="tabItem"
        />
        <ev-tab
          v-for="item in tabItems"
          :key="item.id"
          :tab-prop="item"
        />
      </ev-tabs>
    </div>
  </div>
</template>
<script>
  import targetComponent1 from '../checkbox/checkbox-group-list-handling';
  import targetComponent2 from '../table/table-buffer';
  import targetComponent3 from '../button/button-loading';
  import targetComponent4 from '../chart/chart.bar.stack';
  import targetComponent5 from '../table/table-page';

  const componentList = [targetComponent1, targetComponent2, targetComponent3];

  export default {
    data() {
      return {
        scroll: false,
        tabItem: {
          title: 'appended tab',
          isActive: false,
          targetComponent: {
            keyName: 'targetComponent1',
            component: targetComponent1,
          },
        },
        tabItems: [{
            title: 'appended tab',
            isActive: false,
            targetComponent: {
              keyName: 'targetComponent3',
              component: targetComponent3,
            },
          },
          {
            title: 'appended tab',
            isActive: false,
            targetComponent: {
              keyName: 'targetComponent4',
              component: targetComponent4,
            },
          },
          {
            title: 'appended tab',
            isActive: false,
            targetComponent: {
              keyName: 'targetComponent5',
              component: targetComponent5,
            },
          },
        ],
        list: this.createList(),
      };
    },
    methods: {
      addTab() {
        this.list.push({
          title: 'appended tab',
          isActive: false,
          targetComponent: {
            keyName: 'target-component1',
            component: componentList[0],
          },
        });
      },
      createList() {
        const result = [];
        for (let i = 0, length = 3; i < length; i++) {
          result.push({
            title: 'appended tab',
            isActive: false,
            width: 100,
            targetComponent: {
              keyName: `target-component${i + 1}`,
              component: componentList[i],
            },
          });
        }
        return result;
      },
    },
  };
</script>
<style scoped>
  p{
    margin-left: 30px;
  }
  .button-outer {
    margin-bottom: 5px;
  }
  .outer {
    width: 100%;
  }
  .tab-default-outer {
    width: 1500px;
    height: 1000px;
  }
</style>
