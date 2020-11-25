<template>
  <div class="case">
    <p class="case-title">Common</p>
    <div class="tab-wrapper">
      <ev-tabs
        v-model="activeName1"
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
    </div>
  </div>
  <div class="case">
    <p class="case-title">Common</p>
    <div class="tab-wrapper">
      <ev-tabs
        v-model="activeName2"
      >
        tabPanels2 : {{ tabPanels2 }}
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
import { ref, shallowRef, triggerRef, watchEffect, defineAsyncComponent } from 'vue';

export default {
  setup() {
    const activeName1 = ref('tabName1');
    const tabPanels1 = ref([
      {
        text: 'LABEL1LABEL1LABEL1LABEL1LABEL1',
        value: 'tabName1',
        content: 'content1',
      },
      {
        text: 'LABEL2LABEL2',
        value: 'tabName2',
        content: '<div><h3>HEADER</h3><p>123123123423423423</p></div>',
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
      // {
      //   text: 'LABEL7',
      //   value: 'tabName7',
      //   content: 'content7',
      // },
      // {
      //   text: 'LABEL8'
      //   ,
      //   value: 'tabName8',
      //   content: 'content8',
      // },
      // {
      //   text: 'LABEL9',
      //   value: 'tabName9',
      //   content: 'content9',
      // },
    ]);

    const addItem1 = () => {
      tabPanels1.value.push({
        text: 'NEW TEXT',
        value: `value${tabPanels1.value.length + 1}`,
        content: `content${tabPanels1.value.length + 1}`,
      });
    };

    const activeName2 = ref('comp1');
    const tabPanels2 = shallowRef([
      {
        text: 'LABEL1LABEL1LABEL1LABEL1LABEL1',
        value: 'comp1',
        component: defineAsyncComponent(() => import('./Comp1.vue')),
      },
      {
        text: 'LABEL2LABEL2',
        value: 'comp2',
        component: defineAsyncComponent(() => import('./Comp2.vue')),
      },
      {
        text: 'LABEL3',
        value: 'comp3',
        component: defineAsyncComponent(() => import('./Comp3.vue')),
      },
    ]);

    watchEffect(() => {
      console.log(tabPanels2.value);
    });

    const toggleComp4 = () => {
      if (!tabPanels2.value.find(v => v.value === 'comp4')) {
        tabPanels2.value.push({
          text: 'LABEL4',
          value: 'comp4',
          component: defineAsyncComponent(() => import('./Comp4.vue')),
        });
      } else {
        const comp4Idx = tabPanels2.value.findIndex(v => v.value === 'comp4');
        tabPanels2.value.splice(comp4Idx, 1);
      }
      triggerRef(tabPanels2);
    };

    return {
      activeName1,
      tabPanels1,
      addItem1,

      activeName2,
      tabPanels2,
      toggleComp4,
    };
  },
};
</script>
<style>
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
</style>
