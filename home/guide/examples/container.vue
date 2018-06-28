<template>
  <div style="height: 100%; widht:100%">
    <main-container
      :wrapper-styles="customstyle"
      :height="600"
      :width="600"
      layout="hBox"
    >
      <box-panel
        :height="height"
        :width="width"
        flex="1"
      >
        <chart/>
      </box-panel>
      <resize-bar/>
      <box-panel
        :height="height"
        :width="width"
        flex="1"
      />
      <resize-bar/>
      <box-panel
        :height="height"
        :width="width"
        flex="1"
      />
    </main-container>

    <br>

    <main-container
      :wrapper-styles="customstyle"
      :height="600"
      :width="600"
      layout="vBox"
    >
      <box-panel
        :height="height"
        :width="width"
      />
      <resize-bar/>
      <box-panel
        :height="height"
        :width="width"
      />
      <resize-bar/>
      <box-panel
        :height="height"
        :width="width"
      />
      <box-panel
        :height="height"
        :width="width"
      />
    </main-container>
  </div>
</template>
<script>
  import { mainContainer, ResizeBar, boxPanel } from '@/components/container';
  import chart from './chart';
// horizontal vertical
  export default {
    components: {
      mainContainer, ResizeBar, boxPanel, chart,
    },
    data() {
      return {
        height: '25%',
        width: '100%',
        width2: '25%',
      };
    },
    computed: {
      customstyle() {
        return { 'background-color': '#fff' };
      },
      customstyle1() {
        return { 'background-color': '#fff' };
      },
      customstyle2() {
        return { 'background-color': '#C5CAE9' };
      },
      customstyle3() {
        return { 'background-color': '#EF6C00' };
      },
      customstyle4() {
        return { 'background-color': '#A1887F' };
      },
      customstyle5() {
        return { 'background-color': 'orange' };
      },
    },
    methods: {
    },
  };
</script>
