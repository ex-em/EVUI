<template>
  <div style="height: 400px; widht:100%">
    <container
      layout="hBox"
      :wrapper-styles="costomstyle"
      :height="400"
      @onClickDiv="M_click"
    >
      <container
        layout="vBox"
        :wrapper-styles="costomstyle2"
        :width="400"
        :height="height"
      >
        <container
          layout="vBox"
          :wrapper-styles="costomstyle3"
          :width="50"
          :height="50"
          :flex="0.3"
        >
          0.3
        </container>
        <container
          layout="hBox"
          :wrapper-styles="costomstyle4"
          :width="50"
          :height="50"
          :flex="0.8"
        >
          0.8
        </container>
        <container
          layout="hBox"
          :wrapper-styles="costomstyle5"
          :width="50"
          :height="50"
          :flex="0.4"
        >
          0.4
        </container>
      </container>

      <container
        layout="vBox"
        :wrapper-styles="costomstyle2"
        :width="100"
        :height="100"
      >
        <container
          layout="hBox"
          :wrapper-styles="costomstyle3"
          :width="50"
          :height="50"
        />
        <container
          layout="hBox"
          :wrapper-styles="costomstyle4"
          :width="50"
          :height="50"
        />

      </container>

      <container
        layout="hBox"
        :wrapper-styles="costomstyle2"
        :width="100"
        :height="100"
      >
        <container
          layout="vBox"
          :wrapper-styles="costomstyle3"
          :width="50"
          :height="50"
        />
        <container
          layout="vBox"
          :wrapper-styles="costomstyle4"
          :width="50"
          :height="50"
        />

      </container>

      <container
        layout="vBox"
        :wrapper-styles="costomstyle2"
        :width="100"
        :height="100"
      >
        <container
          layout="hBox"
          :wrapper-styles="costomstyle3"
          :width="50"
          :height="50"
        />
        <container
          layout="hBox"
          :wrapper-styles="costomstyle4"
          :width="50"
          :height="50"
        />
      </container>


      <container
        layout="hBox"
        :wrapper-styles="costomstyle2"
        :width="300"
        :height="100"
      >
        <container
          layout="vBox"
          :wrapper-styles="costomstyle3"
          :width="50"
          :height="50"
          :flex="0.2"
        >
          0.2
        </container>
        <container
          layout="vBox"
          :wrapper-styles="costomstyle4"
          :width="50"
          :height="50"
          :flex="1.5"
        >
          1.5
        </container>
        <container
          layout="vBox"
          :wrapper-styles="costomstyle5"
          :width="50"
          :height="50"
          :flex="0.5"
        >0.5
        </container>
      </container>


      <container
        layout="hBox"
        :wrapper-styles="costomstyle2"
        :width="800"
        :height="100"
      >
        <container
          layout="vBox"
          :wrapper-styles="costomstyle3"
          :width="50"
          :height="50"
          :flex="0.3"
        >
          0.3
        </container>
        <container
          layout="vBox"
          :wrapper-styles="costomstyle4"
          :width="50"
          :height="50"
          :flex="0.8"
        >
          0.8
        </container>
        <container
          layout="vBox"
          :wrapper-styles="costomstyle5"
          :width="50"
          :height="50"
          :flex="0.5"
        >
          0.5
        </container>
      </container>
      <div>1</div>
      <div>2</div>
      <div>3</div>
      <text-box/>
      <text-box/>
      <text-box/>
    </container>
  </div>
</template>
<script>
  import Container from '@/components/Container';
  import TextBox from '@/components/TextBox';
// horizontal vertical
  export default {
    components: {
      Container, TextBox,
    },
    data() {
      return {
        height: '30%',
      };
    },
    computed: {
      costomstyle() {
        return { 'background-color': '#FFCDD2' };
      },
      costomstyle1() {
        return { 'background-color': '#FFF59D' };
      },
      costomstyle2() {
        return { 'background-color': '#C5CAE9' };
      },
      costomstyle3() {
        return { 'background-color': '#EF6C00' };
      },
      costomstyle4() {
        return { 'background-color': '#A1887F' };
      },
      costomstyle5() {
        return { 'background-color': 'orange' };
      },
    },
    methods: {
    },
  };
</script>
<style>
  .custom-resizer {
    width: 100%;
    height: 400px;
  }

  .custom-resizer > .pane {
    text-align: left;
    padding: 15px;
    overflow: hidden;
    background: #eee;
    border: 1px solid #ccc;
  }


  .custom-resizer > .multipane-resizer {
    margin: 0;
    left: 0;
    position: relative;
  }
  .custom-resizer > .multipane-resizer:before {
    display: block;
    content: "● ● ●";
    color: #999999;
    width: 3px;
    height: 40px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -20px;
    margin-left: -5px;
    /*border-left: 1px solid #ccc;*/
    /*border-right: 1px solid #ccc;*/
  }
  .custom-resizer > .multipane-resizer:hover:before {
    color: #333333;
  }

  .vertical-panes {
    width: 100%;
    height: 400px;
    border: 1px solid #ccc;
  }

  .vertical-panes > .pane {
    text-align: left;
    padding: 15px;
    overflow: hidden;
    background: #eee;
  }

  .vertical-panes > .pane ~ .pane {
    border-left: 1px solid #ccc;
  }

</style>

