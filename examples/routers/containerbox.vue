<template>
  <div style="height: 100%; width:100%;border:1px;">
    <container
      layout="vBox"
      :wrapper-styles="customstyle"
      :height="800"
      :width="800"
      :flex="3"
      ref="parkcon"
    >
      <container
        :wrapper-styles="customstyle1"
        ref="parkcon2"
        :width="800"
        :height="300"
      >
        <span>검색 조건 :   </span><input type="text"> <button>조회</button>
        <br>
        <span>ITME_CODE :   </span><input type="text"> <button>조회</button>
      </container>
      <resizebar/>
      <container
        layout="hBox"
        :wrapper-styles="customstyle1"
        :height="300"
      >
        <container
          :wrapper-styles="customstyle1"
          :height="300"
          :width="200"
        >
          <header class="container-title">
            title 1
          </header>
          <div>
            <h6 class="title is-6">Pane 1</h6>
            <span>아이디 :</span>
            <input type="text">
          </div>
        </container>
        <resizebar/>
        <container
          :wrapper-styles="customstyle1"
          :height="300"
          :width="100"
        >
          <header class="container-title">
            title 2
          </header>
        </container>

        <container
          :wrapper-styles="customstyle1"
          :height="300"
          :width="100"
          :flex="3"
        >
          <header class="container-title">
            title 3
          </header>
        </container>
      </container>
      <container
        :wrapper-styles="customstyle1"
        :height="100"
        :flex="3"
      />
    </container>

    <br><br><br>
    <button @click="getWidth" >getWidth</button>
    <button @click="setWidth" >setWidth</button>
    <button @click="getHeight" >getHeight</button>
    <button @click="setHeight" >setHeight</button>
    <button @click="getMinWidth" >getMinWidth</button>
    <button @click="getMaxWidth" >getMaxWidth</button>
    <button @click="getMinHeight" >getMinHeight</button>
    <button @click="getMaxHeight" >getMaxHeight</button>
    <button @click="setMinWidth" >setMinWidth</button>
    <button @click="setMaxWidth" >setMaxWidth</button>
    <button @click="setMinHeight" >setMinHeight</button>
    <button @click="setMaxHeight" >setMaxHeight</button>
    <button @click="getFlex" >getFlex</button>
    <button @click="setFlex" >setFlex</button>
    <button @click="deleteFlex" >deleteFlex</button>
    <br><br><br>
    <div ref="content"/>
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
        return { 'background-color': '#fff', border: '1px solid #000000' };
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
    getWidth() {
        // this.$refs.content.innerHTML = '테스트입니다';
      this.$refs.content.innerHTML = this.$refs.parkcon.getWidth();
    },
    setWidth() {
      this.$refs.parkcon.setWidth('100a%');
      this.$refs.content.innerHTML = ' Width 1000으로 변경 ';
    },
    getHeight() {
      this.$refs.content.innerHTML = this.$refs.parkcon.getHeight();
    },
    setHeight() {
      this.$refs.parkcon.setHeight('100%');
      this.$refs.content.innerHTML = ' height 100%으로 변경 ';
    },
    getMinWidth() {
      this.$refs.content.innerHTML = this.$refs.parkcon.getMinWidth();
    },
    getMaxWidth() {
      this.$refs.content.innerHTML = this.$refs.parkcon.getMaxWidth();
    },
    getMinHeight() {
      this.$refs.content.innerHTML = this.$refs.parkcon.getMinHeight();
    },
    getMaxHeight() {
      this.$refs.content.innerHTML = this.$refs.parkcon.getMaxHeight();
    },
    setMinWidth() {
      this.$refs.parkcon.setMinWidth('100');
      this.$refs.content.innerHTML = ' setMinWidth 100px으로 변경 ';
    },
    setMaxWidth() {
      this.$refs.parkcon.setMaxWidth('600');
      this.$refs.content.innerHTML = ' setMaxWidth 600px으로 변경 ';
    },
    setMinHeight() {
      this.$refs.parkcon.setMinHeight('100');
      this.$refs.content.innerHTML = ' setMinHeight 100px으로 변경 ';
    },
    setMaxHeight() {
      this.$refs.parkcon.setMaxHeight('500');
      this.$refs.content.innerHTML = ' setMaxHeight 500px으로 변경 ';
    },
    getFlex() {
      this.$refs.parkcon.setFlex(2);
      this.$refs.content.innerHTML = this.$refs.parkcon.getFlex();
    },
    setFlex() {
      this.$refs.parkcon.setFlex(4);
      this.$refs.content.innerHTML = ' setFlex 4으로 변경 ';
    },
    deleteFlex() {
      this.$refs.parkcon.deleteFlex();
    },
      // moveing(obj, resizeobj, size) {
      //    console.log(obj, resizeobj, size);
      // },
      // sizestop(obj, resizeobj, size) {
      //     console.log(obj, resizeobj, `${size} 222 `);
      // },
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
  .container-title{
   background-color: #f1f1f1!important;
  }
</style>

