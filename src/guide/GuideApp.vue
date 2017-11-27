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

        <div class="center">
            <cmp-nav v-on:getVueFile="getVueFile"></cmp-nav>
            <cmp-content class="content-area" :fileList="vueFileList" :contentName="contentName"></cmp-content>
        </div>
    </div>
</template>

<script>
    import Nav from './GuideNav.vue';
    import Content from './GuideContent.vue';
    import Result from './GuideResult.vue';

    export default {
        components: {
            'cmpNav': Nav,
            'cmpContent': Content,
            'cmpResult': Result
        },
        data: function () {
            return {
                isLoading: false,
                isError: false,
                vueFileList: {},
                contentName: ''
            }
        },
        methods: {
            getVueFile: function (path) {
                const baseURI = `../../static/`;
                const fileExtension = `txt`;
                var vm = this;
                var fileName = path;

                if(this.vueFileList[fileName]){
                    vm.$root.$eventBus.$emit('update');
                    return;
                }

                this.$http.get(`${baseURI}${fileName}.${fileExtension}`)
                    .then((result) => {
                        let tmpObj = vm.codeParser(result.data);
                    if(tmpObj){
                        vm.$set(vm.vueFileList, fileName, tmpObj);
                        vm.$root.$eventBus.$emit('update');
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
        created: function() {
        },
        mounted: function(){
            this.contentName = this.$route.params.contentName;
            this.getVueFile('ContentA');
        },
        watch: {
          $route: function ( route ) {
              this.contentName = route.params.contentName;
          }
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

    .center {
        position: absolute;
        top: 60px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        height: auto !important;
    }

    .center .content-area {
        padding: 0 !important;
        position: absolute;
        top:0px;
        right:0px;
        left:250px;
        bottom:0px;
    }

    p {
        font-size: 15px;
    }
</style>
