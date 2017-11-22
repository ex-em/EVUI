<template>
    <div class="guide-app">
        <div class="loading" v-if="isLoading">Loading...</div>
        <div class="error" v-if="isError">{{ isError }}</div>

        <div class="header">
            <div class="logo">
                <img src="../images/exem-logo.png"/>
            </div>
            <div class="top">
                <p>Exem Guide Sample</p>
            </div>
        </div>

        <div class="container">
            <cmp-nav v-on:getVueFile="getVueFile"></cmp-nav>
            <div class="right">
                <cmp-content :fileList="vueFileList"></cmp-content>
                <cmp-result ref="cmpResult" :fileList="vueFileList"></cmp-result>
            </div>

            <!--<cmp-content ref="cmpContent" @emitContent="emitContent"></cmp-content>-->
            <!--<div><router-view name="Result"></router-view></div>-->
        </div>
    </div>
</template>

<script>
    //import CodeParser from './../codeParser.js';
    import Nav from './GuideNav.vue';
    import Content from './GuideContent.vue';
    import Result from './GuideResult.vue';

    export default {
        components: {
            'cmpNav': Nav,
            'cmpContent': Content,
            'cmpResult': Result
        },
        computed:{
          initText: function () {
            return {
              value : `EVUI는 웹페이지의 핵심 구성요소인 Grid/Chart 컴포넌트를 제공하는 UI 프레임워크입니다.
                       EVUI Grid와 Chart는 HTML/CSS/JS 및 SVG로 구현되어 있어 다양한 환경에 적용이 가능하며,
                       Vue.JS를 기반으로 구현되어 대량의 데이터를 고속으로 처리합니다.`
            }
          }
        },
        data: function () {
            return {
                isLoading: false,
                isError: false,
                vueFileList: {}
            }
        },
        methods: {
            emitContent: function (id) {
                var contentView;

                if ( id == 'updateResult' ) {
                    contentView = this.$refs.contentView;
                    this.$refs.cmpResult.update( contentView.getContentName(), contentView .getValue() );
                }
            },
            getVueFile: function (path) {
                const baseURI = '../../static/';
                var vm = this;
                var fileName = path;

                if(this.vueFileList[fileName]){
                    return;
                }

                this.$http.get(`${baseURI}${fileName}.vue`)
                        .then((result) => {
                    let tmpObj = vm.codeParser(result.data);
                    if(tmpObj){
                        vm.$set(vm.vueFileList, fileName, tmpObj);
                    }
                }, (err) => {});
            },
            codeParser: function(data = null , ...rest){
                let ix, ixLen;
                let startTag, endTag;
                let startIndex, endIndex;
                let keyList;

                let obj = {
                    template: '',
                    style: '',
                    script: ''
                };

                if(!data){
                    return data;
                }

                keyList = Object.keys(obj);

                for(ix = 0, ixLen = keyList.length; ix < ixLen; ix++){
                    startTag = `<${keyList[ix]}>`;
                    endTag = `</${keyList[ix]}>`;
                    keyList[ix] === 'style' ? startIndex = data.lastIndexOf(startTag) : startIndex = data.indexOf(startTag);
                    endIndex = data.lastIndexOf(endTag);
                    obj[keyList[ix]] = data.substring(startIndex + startTag.length, endIndex).trim();
                }

                return obj;
            }
        },
        mounted: function(){
            this.getVueFile('ContentA');
        }

    }
</script>

<style>
    .guide-app {
        width: 100%;
        height: 100%;
        font: normal 12px/14px tahoma,arial,verdana,sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
    }
    .guide-app .header {
        position:absolute;
        left: 0px;
        top: 0px;
        bottom: 0px;
        height: 59px;
        right: 0px;
        margin: 0 auto;
        text-align: center;
        background: white;
        border: 1px solid #e5e5e5;
    }
    .guide-app .header .logo {
        position: relative;
        float: left;
        width: 90px;
        z-index: 1;
        padding-top: 20px;
    }
    .guide-app .header .logo > img {
        max-width: 80%;
        cursor: pointer;
    }
    .guide-app .header .top {
        position: relative;
    }
    .guide-app .header .top > p {
        font-size: 20px;
    }

    .guide-app .container {
        position: absolute;
        top: 60px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        height: auto !important;
    }
    .guide-app .container .right {
        padding: 0 !important;
        position: absolute;
        top:0px;
        right:0px;
        left:250px;
        bottom:0px;
    }


    button {
      height: 29px;
      width: 100px;
      border-radius: 6px;
      color: #fff;
      background-image: -webkit-linear-gradient(top, #55d1ff 0%, #00b4f7 100%);
      border: 1px solid #4d899d;
    }
    button:hover {
      border-radius: 6px;
      color: #fff;
      background-image: -webkit-linear-gradient(top, #40abf5 0%, #0091f7 100%);
      border: 1px solid #4d899d;
      text-shadow: 0px 1px 0px rgba(16,126,173,.9);
      cursor: pointer;
    }

    p {
      font-size: 15px;
    }
</style>
