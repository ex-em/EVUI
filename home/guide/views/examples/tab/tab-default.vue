<template>
  <div class="outer">
    <div class="button-outer">
      <ev-button
        :type="'primary'"
        @click="addTab"
      >
        Add Tab
      </ev-button>
      <ev-button
        :type="'primary'"
        @click="randomChangeTab"
      >
        Change Tab
      </ev-button>
    </div>
    <div class="tab-default-outer">
      <ev-tabs
        v-model="tabItems"
        :active-tab-value="activeTabValue"
        :use-tab-moving="true"
        :min-tab-width="100"
        @change-tab="changeTab"
      >
        <ev-tab-panel
          v-for="item in tabItems"
          :key="item.value"
          :value="item.value"
        >
          <component
            :is="item.content"
          />
        </ev-tab-panel>
      </ev-tabs>
    </div>
  </div>
</template>

<script>
  import targetComponent1 from '../checkbox/checkbox-group-default';
  import targetComponent2 from '../table/table-buffer';
  import targetComponent3 from '../chart/chart.bar.stack';
  import targetComponent4 from '../table/table-page';

  export default {
    components: {
      targetComponent1,
      targetComponent2,
      targetComponent3,
      targetComponent4,
    },
    data() {
      return {
        seq: 0,
        tabItems: [],
        activeTabValue: '1',
      };
    },
    created() {
      this.createTabs();
    },
    methods: {
      createTabs() {
        for (let ix = 0; ix < 4; ix++) {
          this.tabItems.push({
            title: `appended tab${this.seq}`,
            value: `${this.seq}`,
            content: `targetComponent${(this.seq % 4) + 1}`,
          });

          this.seq++;
        }
      },
      addTab() {
        this.tabItems.push({
          title: `appended tab${this.seq}`,
          value: `${this.seq}`,
          content: `targetComponent${(this.seq % 4) + 1}`,
        });
        this.activeTabValue = `${this.seq}`;
        this.seq++;
      },
      changeTab(oldValue, newValue) {
        this.activeTabValue = newValue;
      },
      randomChangeTab() {
        this.activeTabValue = `${Math.floor(Math.random() * Math.floor(this.seq))}`;
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
    width: 100%;
    height: 100%;
  }
</style>
