<template>
  <div class="case">
    <p class="case-title">Common</p>
    <div class="tab-wrapper">
      <ev-tabs
        v-model="selectedValue1"
        v-model:panels="tabPanels1"
        :closable="true"
      >
        <ev-tab-panel
          v-for="(item, idx) in tabPanels1"
          :key="`${item.name}_${idx}`"
          :text="item.text"
          :value="item.value"
        >
          <div v-html="item.content"/>
        </ev-tab-panel>
      </ev-tabs>
    </div>
    <div class="description">
      <button
        class="btn"
        @click="addItem1"
      >
        addItem
      </button>
      &nbsp;&nbsp;&nbsp;
      <button
        class="btn"
        @click="popItem1"
      >
        popItem
      </button>
      &nbsp;&nbsp;&nbsp;
      <button
        class="btn"
        @click="spliceItem1"
      >
        spliceItem1
      </button>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Draggable</p>
    <div class="tab-wrapper">
      <ev-tabs
        v-model="selectedValue1"
        v-model:panels="tabPanels1"
        :draggable="true"
      >
        <ev-tab-panel
          v-for="(item, idx) in tabPanels1"
          :key="`${item.name}_${idx}`"
          :text="item.text"
          :value="item.value"
        >
          <div v-html="item.content"/>
        </ev-tab-panel>
      </ev-tabs>
    </div>
  </div>
  <div class="case">
    <p class="case-title">With Component</p>
    <div class="tab-wrapper">
      <ev-tabs
        v-model="selectedValue2"
        v-model:panels="tabPanels2"
        class="example2"
      >
        <ev-tab-panel
          v-for="(item, idx) in tabPanels2"
          :key="`${item.name}_${idx}`"
          :text="item.text"
          :value="item.value"
        >
          <component
            :is="item.component"
            v-if="item.component"
            class="componentCls"
          />
        </ev-tab-panel>
      </ev-tabs>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Stretch Tab Name</p>
    <div class="tab-wrapper">
      <ev-tabs
        v-model="selectedValue2"
        v-model:panels="tabPanels2"
        :stretch="true"
        :closable="true"
      >
        <ev-tab-panel
          v-for="(item, idx) in tabPanels2"
          :key="`${item.name}_${idx}`"
          :text="item.text"
          :value="item.value"
        >
          <component
            :is="item.component"
            v-if="item.component"
            class="componentCls"
          />
        </ev-tab-panel>
      </ev-tabs>
    </div>
    <div class="description">
      <button
        class="btn"
        @click="toggleComp4"
      >
        Toggle Component 4
      </button>
    </div>
  </div>
</template>

<script>
import { ref, shallowRef, triggerRef, defineAsyncComponent } from 'vue';

export default {
  setup() {
    const selectedValue1 = ref('tabName2');
    const tabPanels1 = ref([
      {
        text: 'LABEL1LABEL1LABEL1LABEL1LABEL1',
        value: 'tabName1',
        content: 'content1',
      },
      {
        text: 'LABEL2LABEL2',
        value: 'tabName2',
        content: '<div class="example1-label"><h3>HEADER</h3><p>123123123423423423</p></div>',
      },
      {
        text: 'LABEL3',
        value: 'tabName3',
        content: 'content3',
      },
      {
        text: 'LABEL4',
        value: 'tabName4',
        content: 'content4',
      },
      {
        text: 'LABEL5',
        value: 'tabName5',
        content: 'content5',
      },
      {
        text: 'LABEL6',
        value: 'tabName6',
        content: 'content6',
      },
    ]);
    const idx = ref(tabPanels1.value.length + 1);

    const addItem1 = () => {
      tabPanels1.value.push({
        text: 'NEW TEXT',
        value: `value${idx.value}`,
        content: `content${idx.value}`,
      });
      idx.value++;
    };

    const popItem1 = () => {
      if (tabPanels1.value.length > 1) {
        tabPanels1.value.pop();
      }
    };
    const spliceItem1 = () => {
      if (tabPanels1.value.length > 1) {
        tabPanels1.value.splice(0, 1);
      }
    };

    const selectedValue2 = ref('comp1');
    const tabPanels2 = shallowRef([
      {
        text: 'LABEL1LABEL1LABEL1LABEL1LABEL1',
        value: 'comp1',
        component: defineAsyncComponent(() => import('./Comp1.vue')),
        iconClass: 'ev-icon-question',
      },
      {
        text: 'LABEL2LABEL2',
        value: 'comp2',
        component: defineAsyncComponent(() => import('./Comp2.vue')),
        iconClass: 'ev-icon-shard',
      },
      {
        text: 'TEXT3TEXT3TEXT3EXT3TEXT3TEX3',
        value: 'comp3',
        component: defineAsyncComponent(() => import('./Comp3.vue')),
        iconClass: 'ev-icon-bell',
      },

    ]);

    const toggleComp4 = () => {
      const comp4Idx = tabPanels2.value.findIndex(v => v.value === 'comp4');
      if (comp4Idx < 0) {
        tabPanels2.value.push({
          text: 'LABEL4LABEL4LABEL4LABEL4LABEL4',
          value: 'comp4',
          component: defineAsyncComponent(() => import('./Comp4.vue')),
          iconClass: 'ev-icon-binder',
        });
      } else {
        tabPanels2.value.splice(comp4Idx, 1);
      }
      triggerRef(tabPanels2);
    };

    return {
      selectedValue1,
      tabPanels1,
      addItem1,
      popItem1,
      spliceItem1,

      selectedValue2,
      tabPanels2,
      toggleComp4,
    };
  },
};
</script>

<style lang="scss">
.tab-wrapper {
  width: 100%;
  height: 100%;
}

.componentCls {
  padding: 20px;
  border: 1px solid #B2B2B2;
  border-top: none;
  border-radius: 0 0 4px 4px;
}

.example1-label {
  padding: 20px;
}

.example2 {
  .ev-tabs-title {
    width: 150px;
  }
}
</style>
