<template>
    <div class="guide-app">
        <div class="loading" v-if="isLoading">Loading...</div>
        <div class="error" v-if="isError">{{ isError }}</div>

        <div class="center">
            <cmp-nav v-on:getVueFile="getVueFile"></cmp-nav>
            <cmp-content class="content-area" :fileList="vueFileList" :contentName="contentName"></cmp-content>
        </div>
    </div>
</template>

<script>
    import Nav from './GuideNav.vue';
    import Content from './GuideContent.vue';

    export default {
        components: {
            'cmpNav': Nav,
            'cmpContent': Content,
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
                if(path) {
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
                }
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
        font: normal 12px/14px Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        position: absolute;
    }

    .guide-app .center {
        position: relative;
        left: 0px;
        right: 0px;
        bottom: 0px;
        height: 100%;
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
