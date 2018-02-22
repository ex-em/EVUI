<template>
  <div style="height: 100%; widht:100%">
    <container
      layout="hBox"
      :wrapper-styles="customstyle"
      :height="100"
    >

      <container
        :wrapper-styles="customstyle"
        :height="100"
        :width="195"
      >
        <header class="container-title">
          title 1
        </header>
        <button>A</button>
      </container>
      <resizebar/>
      <container
        :wrapper-styles="customstyle"
        :height="100"
        :width="195"
      >
        <header class="container-title">
          title 2
        </header>
      </container>
      <container
        :wrapper-styles="customstyle"
        :height="100"
        :width="200"
        :flex="1"
      >
        <header class="container-title">
          title 3
        </header>
      </container>
    </container>

    <br><br>
    <!-- Vbox -->
    <container
      layout="vBox"
      :wrapper-styles="customstyle"
      :height="400"
    >

      <container
        layout="hBox"
        :wrapper-styles="customstyle1"
        :height="100"
        :width="200"
      >
        <container
          :wrapper-styles="customstyle"
          :height="50"
          :width="50"
        >
          <header class="container-title">
            title 1
          </header>
        </container>
        <container
          :wrapper-styles="customstyle"
          :height="50"
          :width="50"
        >
          <header class="container-title">
            title 2
          </header>
        </container>
        <container
          :wrapper-styles="customstyle"
          :height="50"
          :width="50"
        >
          <header class="container-title">
            title 3
          </header>
        </container>

      </container>
      <resizebar/>
      <container
        :wrapper-styles="customstyle"
        :height="300"
        :width="300"
        :flex="1"
      >
        <header class="container-title">
          title 2
        </header>
      </container>
      <container
        :wrapper-styles="customstyle"
        :height="300"
        :width="300"
        :flex="3"
      >
        <header class="container-title">
          title 3
        </header>
      </container>
    </container>

    <br><br>

    <container
      layout="hBox"
      :wrapper-styles="customstyle"
      :height="300"
    >

      <container
        :wrapper-styles="customstyle"
        :height="300"
        :width="195"
        :min-width="300"
      >
        <header class="container-title">
          title 1
        </header>
      </container>
      <resizebar/>
      <container
        :wrapper-styles="customstyle"
        :height="300"
        :width="195"
        :flex="2"
      >
        <header class="container-title">
          title 2
        </header>
      </container>
      <container
        :wrapper-styles="customstyle"
        :height="300"
        :width="200"
      >
        <header class="container-title">
          title 3
        </header>
      </container>
    </container>
  </div>
</template>
<script>
  import { Container, Resizebar } from '@/components/container';

// horizontal vertical
  export default {
    components: {
      Container, Resizebar,
    },
    data() {
      return {
        height: '30%',
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
<style>
  /*.custom-resizer {*/
    /*width: 100%;*/
    /*height: 400px;*/
  /*}*/

  .Container > .pane {
    text-align: left;
    padding: 15px;
    overflow: hidden;
    background: #eee;
    border: 1px solid #ccc;
  }

  /*.Container > .resizebar {*/
    /*z-index: 3;*/
    /*margin: 0;*/
    /*left: 0;*/
    /*position: relative;*/
  /*}*/
  /*.Container > .resizebar:before {*/
    /*display: block;*/
    /*content: "● ● ●";*/
    /*color: #999999;*/
    /*width: 3px;*/
    /*height: 100%;*/
    /*position: absolute;*/
    /*top: 50%;*/
    /*left: 50%;*/
    /*!*margin-top: -20px;*!*/
    /*!*margin-left: -5px;*!*/
    /*!*border-left: 1px solid #ccc;*!*/
    /*!*border-right: 1px solid #ccc;*!*/
  /*}*/
  /*.Container > .resizebar:hover:before {*/
    /*color: #333333;*/
  /*}*/

  /*.vertical-panes {*/
    /*width: 100%;*/
    /*height: 400px;*/
    /*border: 1px solid #ccc;*/
  /*}*/

  /*.vertical-panes > .pane {*/
    /*text-align: left;*/
    /*padding: 15px;*/
    /*overflow: hidden;*/
    /*background: #eee;*/
  /*}*/

  /*.vertical-panes > .pane ~ .pane {*/
    /*border-left: 1px solid #ccc;*/
  /*}*/

  .container-title{
   background-color: #f1f1f1!important;
  }
</style>

