<template>
    <div id="source" class="source">
        <form id="resultForm" method="post" action="http://jsfiddle.net/api/post/vue/2.2.1/" target="check" style="display:none">
            <select name="panel_html">
                <option value="0" selected>HTML</option>
            </select>
            <select name="panel_js">
                <option value="0" selected>JavaScript</option>
            </select>
            <select name="panel_css">
                <option value="0" selected>CSS</option>
            </select>

            <textarea name='html'>{{ editorInfo.html.value }}</textarea>
            <textarea name='js'>{{ editorInfo.javascript.value }}</textarea>
            <textarea name='css'>{{ editorInfo.css.value }}</textarea>
        </form>

        <ul class="tab-title">
            <li v-for="name in tabList" :class="{active: name===active}" @click="tabChange(name)">
                <span>{{name}}</span>
                <!--<span class="close" v-if="name !== 'default'" @click="closeTab(name)">&times;</span>-->
            </li>
        </ul>

        <div class="editor" id="editor"></div>

        <div class="tryItDiv"><button @click="tryIt()">Try it</button></div>

        <!--<div class="test">{{ fileList }}</div>-->

    </div>
</template>

<script>
    export default {
        props: {
            fileList: Object,
            contentName: {
                type: String,
                default: ''
            },
            editorInfo: {
                type: Object,
                default: function() {
                    return {
                        html: {
                            theme: 'ace/theme/textmate',
                            mode: 'ace/mode/javascript',
                            readOnly: true,
                            value: ''
                        },
                        javascript: {
//              theme: 'ace/theme/monokai',
                            theme: 'ace/theme/textmate',
                            mode: 'ace/mode/javascript',
                            readOnly: true,
                            value: ''
                        },
                        css: {
//              theme: 'ace/theme/monokai',
                            theme: 'ace/theme/textmate',
                            mode: 'ace/mode/javascript',
                            readOnly: true,
                            value: ''
                        }
                    }
                }
            }
        },
        data() {
        return {
            active: 'default',
            tabList: ['HTML', 'JAVASCRIPT', 'CSS'],
            editor: null,
            result: ''
        }
    },
    watch: {
        $route: function () {
            this.refreshEditor();
        }
    },
    methods: {
        refreshEditor() {
            if(this.fileList[this.contentName]){
                this.editorInfo.html.value = this.fileList[this.contentName].template;
                this.editorInfo.javascript.value = this.fileList[this.contentName].script;
                this.editorInfo.css.value = this.fileList[this.contentName].style;
            }
            this.tabChange();
        },
        /**
         * settings after change tab
         * @param {string} name - Tab Title
         */
        tabChange(name) {
            this.active = name || 'HTML';

            switch (this.active) {
                case 'HTML'      : this.setEditor(this.editorInfo.html); break;
                case 'JAVASCRIPT': this.setEditor(this.editorInfo.javascript); break;
                case 'CSS'       : this.setEditor(this.editorInfo.css); break;
                default: break;
            }
        },
        setEditor(paramObj) {
            var defaultObj = {
                theme: 'ace/theme/textmate',
                mode: 'ace/mode/javascript',
                readOnly: true,
                value: ''
            };

            Object.assign( defaultObj, paramObj );

            this.editor.setTheme(defaultObj.theme);
            this.editor.getSession().setMode(defaultObj.mode);
            this.editor.setReadOnly(defaultObj.readOnly);
            this.editor.setValue(defaultObj.value);
        },
        tryIt() {
            document.getElementById('resultForm').submit();
        }
    },
    mounted() {
        var ace = require('brace');
        require('brace/mode/javascript');
        require('brace/theme/monokai');

        this.editor = ace.edit('editor');
        this.editor.$blockScrolling = Infinity; // ace.js 현재버전에서 warning 문제 해결을 위함
        this.editor.setShowPrintMargin(false); // editor의 vertical line 숨기기

        this.$root.$eventBus.$on('update', this.refreshEditor);
    }
    }
</script>


<style scoped>
    .source {
        position: absolute;
        left: 0px;
        top: 0px;
        bottom: 0px;
        width: 50%;
        border-bottom: 1px solid #e5e5e5;
    }

    .tab-title {
        height: 32px; margin: 18px 0 20px 0;
        border-bottom: 1px solid #e5e5e5;
        list-style: none;
        padding: 0 0 1px 20px;
    }
    .tab-title li {
        min-width: 100px; height: 32px; line-height:32px; float: left; margin-right: 1px;
        text-align:center; cursor: pointer;
        background: #eee; color: #000;
        position: relative;
        border: 1px solid #ddd;
        border-bottom-color: transparent;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
    }
    .tab-title li.active {
        background: #fff; color: #000 !important;
        font-weight: bold;
    }
    .tab-title li:hover {
        background: #fff; color: #00baff;
    }
    .tab-title li > span {
        font-size: 13px;
    }

    .editor {
        width: 100%;
        height: calc(100% - 160px);
    }

    .tryItDiv {
        height: 55px;
        text-align: right;
        margin: 10px 100px 0 0;
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
</style>