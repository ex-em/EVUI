<template>
  <div class="outer">
    <div class="button-outer">
      <Button
        :type="'primary'"
        :text="'Tab Add'"
        @click="addTab"
      />
      <Button
        :type="'primary'"
        :text="'change Scroll'"
        @click="scroll = !scroll"
      />
    </div>
    <div class="tab-default-outer">
      <tabs
        :scrollable="scroll"
        :tab-data="list"
      />
    </div>
  </div>
</template>
<script>
  import tab from '@/components/tab/tab';
  import tabs from '@/components/tab/tabs';
  import Button from '@/components/button/button';
  import targetComponent1 from '../checkbox/checkbox-group-list-handling';
  import targetComponent2 from '../checkbox/checkbox-group-align';
  import targetComponent3 from '../checkbox/checkbox-group-default';

  const componentList = [targetComponent1, targetComponent2, targetComponent3];

  export default {
    components: {
      tab,
      tabs,
      Button,
    },
    data() {
      return {
        scroll: false,
        tabItem: {
          title: 'tab-item0',
          isActive: false,
          targetComponent: {
            keyName: 'targetComponent1',
            component: targetComponent1,
          },
        },
        tabItems: [{
            title: 'tab-item1',
            isActive: false,
          },
          {
            title: 'tab-item2',
            isActive: false,
          },
          {
            title: 'tab-item3',
            isActive: false,
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
            title: `tab${i + 1}`,
            isActive: false,
            width: 300,
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
