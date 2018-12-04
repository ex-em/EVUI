<template>
  <div class="outer">
    <div class="button-outer">
      <ev-button
        :type="'primary'"
        @click="addTab"
      >
        Tab Add
      </ev-button>
    </div>
    <div class="tab-default-outer">
      <ev-tabs
        v-model="activeTabName"
        :use-tab-moving="true"
        @remove-tab="removeTab"
        @change-tab="changeTab"
      >
        <ev-tab-panel
          v-for="item in tabItems"
          :key="item.value"
          :title="item.title"
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
  import targetComponent1 from '../checkbox/checkbox-group-list-handling';
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
        seq: 1,
        tabItems: [],
        activeTabName: '1',
      };
    },
    created() {
      this.createTabs();
    },
    methods: {
      createTabs() {
        for (let ix = 0; ix < 10; ix++) {
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
        this.activeTabName = `${this.seq}`;
        this.seq++;
      },
      removeTab(value) {
        for (let ix = 0; ix < this.tabItems.length; ix++) {
          if (this.tabItems[ix].value === value) {
            this.tabItems.splice(ix, 1);
            break;
          }
        }
      },
      changeTab(oldValue, newValue) {
        window.console.log(`oldValue: ${oldValue}`);
        window.console.log(`newValue: ${newValue}`);
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
