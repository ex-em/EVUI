<template>
    <div id="main" class="markdown-body">
        <h1 id="evui">EVUI</h1>

        <h2 id="install">Install</h2>

        <p>Simply run <code>npm install evui --save</code></p>

        <p>Or if you want to use it directly in the browser add</p>

        <pre><code class="html language-html">
        &lt;script src="https://unpkg.com/evui@0.1.2/dist/evui.js"&gt;&lt;/script&gt;
        </code></pre>

        <h3 id="browser">Browser</h3>

        <p>You can use <code>evui</code> directly in the browser without any build setup. You also need to add the evui CDN script.</p>

        <p>You can then simply use it your app:</p>

        <pre><code class="html language-html">
        &lt;!DOCTYPE html&gt;
        &lt;html lang="en"&gt;
        &lt;head&gt;
        &lt;meta charset="UTF-8"&gt;
        &lt;script src="https://unpkg.com/vue/dist/vue.js"&gt;&lt;/script&gt;
        &lt;script type="https://unpkg.com/evui@0.1.2/dist/evui.js"&gt;&lt;/script&gt;

        &lt;title&gt;EVUI&lt;/title&gt;
        &lt;/head&gt;
        &lt;body&gt;
            &lt;div id="evui"&gt;
                &lt;grid :gridInfo="gridInfo"
                         :columns="gridColumns"
                         :data="rowData"&gt;
                &lt;/grid&gt;
            &lt;div&gt;
            &lt;script type="text/javascript"&gt;
                new Vue({
                    el: '#evui',
                    data: {
                    gridInfo: {
                        width : 800,
                        height : 300,
                    },
                    gridColumns: [
                        {dataIndex: 'col1', name: 'column1', width: 300, visible: true, type: 'string', render: 'text'},
                        {dataIndex: 'col2', name: 'column2', width: 200, visible: true, type: 'string', render: 'text'},
                        {dataIndex: 'col3', name: 'column3', width: 150, visible: true, type: 'string', render: 'text'},
                    ],
                    rowData : [
                        {col1: 'sample_data_1', col2: 'sample_data_2', col3: 'sample_data_3'},
                        {col1: 'sample_data_4', col2: 'sample_data_5', col3: 'sample_data_6'},
                        {col1: 'sample_data_7', col2: 'sample_data_8', col3: 'sample_data_9'}
                    ]
                },
            });
            &lt;/script&gt;
        &lt;/body&gt;
        </code></pre>
        <h3 id="webpack2">Webpack 2</h3>
        <p>If you're using Webpack 2 it will automatically use the <code>jsnext:main</code> / <code>module</code> entry point.</p>
        <h2 id="howtouse">How to use</h2>
        <p>You need to import the component.
            You can import the whole package.</p>
        <p>Use it in your vue app.</p>
        <pre><code class="javascript language-javascript">
        import Vue from 'vue'
        import evui from 'evui'

        Vue.use(evui)
        </code></pre>

        <pre><code class="javascript language-javascript">
        &lt;template&gt;
            &lt;grid :gridInfo="gridInfo"
                     :columns="gridColumns"
                     :data="rowData"&gt;
            &lt;/grid&gt;
        &lt;/template&gt;
        &lt;script&gt;
            export default {
                data () {
                    return {
                        gridInfo: {
                            width : 800,
                            height : 300,
                        },
                        gridColumns: [
                            {dataIndex: 'col1', name: 'column1', width: 300, visible: true, type: 'string', render: 'text'},
                            {dataIndex: 'col2', name: 'column2', width: 200, visible: true, type: 'string', render: 'text'},
                            {dataIndex: 'col3', name: 'column3', width: 150, visible: true, type: 'string', render: 'text'},
                        ],
                        rowData : [
                            {col1: 'sample_data_1', col2: 'sample_data_2', col3: 'sample_data_3'},
                            {col1: 'sample_data_4', col2: 'sample_data_5', col3: 'sample_data_6'},
                            {col1: 'sample_data_7', col2: 'sample_data_8', col3: 'sample_data_9'}
                        ]
                     }
                }
            }
        &lt;/script&gt;
        </code></pre>
        <h2 id="buildsetup">Build Setup</h2>
        <pre><code class=" bash language- bash">
        # install dependencies
        npm install

        # serve with hot reload at localhost:8080
        npm run dev

        # build for production with minification
        npm run build
        </code></pre>

        <p>For a detailed explanation on how things work, check out the <a href="http://vuejs-templates.github.io/webpack/">guide</a> and <a href="http://vuejs.github.io/vue-loader">docs for vue-loader</a>.</p>

        <h2 id="contributing">Contributing</h2>

        <ol>
            <li>Fork it ( https://github.com/ex-em/EVUI/fork )</li>

            <li>Create your feature branch (<code>git checkout -b my-new-feature</code>)</li>

            <li>Commit your changes (<code>git commit -am 'Add some feature'</code>)</li>

            <li>Push to the branch (<code>git push origin my-new-feature</code>)</li>

            <li>Create a new Pull Request</li>
        </ol>

        <h2 id="license">License</h2>

        <p>This software is distributed under <a href="LICENSE.txt">MIT license</a>.</p>
    </div>
</template>

<script>
    //
</script>

<style>
    #main {
        padding : 10px 0 0 30px;
    }
    pre {
        overflow : auto;
        background-color : #F6F8FA;
        width : 80%;
    }
    @font-face {
        font-family: octicons-link;
        src: url(data:font/woff;charset=utf-8;base64,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) format('woff');
    }

    .markdown-body {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        line-height: 1.5;
        color: #24292e;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 16px;
        line-height: 1.5;
        word-wrap: break-word;
    }

    .markdown-body a {
        background-color: transparent;
        -webkit-text-decoration-skip: objects;
    }

    .markdown-body a:active,
    .markdown-body a:hover {
        outline-width: 0;
    }

    .markdown-body strong {
        font-weight: inherit;
    }

    .markdown-body strong {
        font-weight: bolder;
    }

    .markdown-body h1 {
        font-size: 2em;
        margin: 0.67em 0;
    }

    .markdown-body img {
        border-style: none;
    }

    .markdown-body svg:not(:root) {
        overflow: hidden;
    }

    .markdown-body code,
    .markdown-body kbd,
    .markdown-body pre {
        font-family: monospace, monospace;
        font-size: 1em;
    }

    .markdown-body hr {
        box-sizing: content-box;
        height: 0;
        overflow: visible;
    }

    .markdown-body input {
        font: inherit;
        margin: 0;
    }

    .markdown-body input {
        overflow: visible;
    }

    .markdown-body [type="checkbox"] {
        box-sizing: border-box;
        padding: 0;
    }

    .markdown-body * {
        box-sizing: border-box;
    }

    .markdown-body input {
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }

    .markdown-body a {
        color: #0366d6;
        text-decoration: none;
    }

    .markdown-body a:hover {
        text-decoration: underline;
    }

    .markdown-body strong {
        font-weight: 600;
    }

    .markdown-body hr {
        height: 0;
        margin: 15px 0;
        overflow: hidden;
        background: transparent;
        border: 0;
        border-bottom: 1px solid #dfe2e5;
    }

    .markdown-body hr::before {
        display: table;
        content: "";
    }

    .markdown-body hr::after {
        display: table;
        clear: both;
        content: "";
    }

    .markdown-body table {
        border-spacing: 0;
        border-collapse: collapse;
    }

    .markdown-body td,
    .markdown-body th {
        padding: 0;
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
        margin-top: 0;
        margin-bottom: 0;
    }

    .markdown-body h1 {
        font-size: 32px;
        font-weight: 600;
    }

    .markdown-body h2 {
        font-size: 24px;
        font-weight: 600;
    }

    .markdown-body h3 {
        font-size: 20px;
        font-weight: 600;
    }

    .markdown-body h4 {
        font-size: 16px;
        font-weight: 600;
    }

    .markdown-body h5 {
        font-size: 14px;
        font-weight: 600;
    }

    .markdown-body h6 {
        font-size: 12px;
        font-weight: 600;
    }

    .markdown-body p {
        margin-top: 0;
        margin-bottom: 10px;
    }

    .markdown-body blockquote {
        margin: 0;
    }

    .markdown-body ul,
    .markdown-body ol {
        padding-left: 0;
        margin-top: 0;
        margin-bottom: 0;
    }

    .markdown-body ol ol,
    .markdown-body ul ol {
        list-style-type: lower-roman;
    }

    .markdown-body ul ul ol,
    .markdown-body ul ol ol,
    .markdown-body ol ul ol,
    .markdown-body ol ol ol {
        list-style-type: lower-alpha;
    }

    .markdown-body dd {
        margin-left: 0;
    }

    .markdown-body code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 12px;
    }

    .markdown-body pre {
        margin-top: 0;
        margin-bottom: 0;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 12px;
    }

    .markdown-body::before {
        display: table;
        content: "";
    }

    .markdown-body::after {
        display: table;
        clear: both;
        content: "";
    }

    .markdown-body>*:first-child {
        margin-top: 0 !important;
    }

    .markdown-body>*:last-child {
        margin-bottom: 0 !important;
    }

    .markdown-body a:not([href]) {
        color: inherit;
        text-decoration: none;
    }

    .markdown-body p,
    .markdown-body blockquote,
    .markdown-body ul,
    .markdown-body ol,
    .markdown-body dl,
    .markdown-body table,
    .markdown-body pre {
        margin-top: 0;
        margin-bottom: 16px;
    }

    .markdown-body hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: #e1e4e8;
        border: 0;
    }

    .markdown-body blockquote {
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
    }

    .markdown-body blockquote>:first-child {
        margin-top: 0;
    }

    .markdown-body blockquote>:last-child {
        margin-bottom: 0;
    }

    .markdown-body kbd {
        display: inline-block;
        padding: 3px 5px;
        font-size: 11px;
        line-height: 10px;
        color: #444d56;
        vertical-align: middle;
        background-color: #fafbfc;
        border: solid 1px #c6cbd1;
        border-bottom-color: #959da5;
        border-radius: 3px;
        box-shadow: inset 0 -1px 0 #959da5;
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
    }

    .markdown-body h1 {
        padding-bottom: 0.3em;
        font-size: 2em;
        border-bottom: 1px solid #eaecef;
    }

    .markdown-body h2 {
        padding-bottom: 0.3em;
        font-size: 1.5em;
        border-bottom: 1px solid #eaecef;
    }

    .markdown-body h3 {
        font-size: 1.25em;
    }

    .markdown-body h4 {
        font-size: 1em;
    }

    .markdown-body h5 {
        font-size: 0.875em;
    }

    .markdown-body h6 {
        font-size: 0.85em;
        color: #6a737d;
    }

    .markdown-body ul,
    .markdown-body ol {
        padding-left: 2em;
    }

    .markdown-body ul ul,
    .markdown-body ul ol,
    .markdown-body ol ol,
    .markdown-body ol ul {
        margin-top: 0;
        margin-bottom: 0;
    }

    .markdown-body li>p {
        margin-top: 16px;
    }

    .markdown-body li+li {
        margin-top: 0.25em;
    }

    .markdown-body dl {
        padding: 0;
    }

    .markdown-body dl dt {
        padding: 0;
        margin-top: 16px;
        font-size: 1em;
        font-style: italic;
        font-weight: 600;
    }

    .markdown-body dl dd {
        padding: 0 16px;
        margin-bottom: 16px;
    }

    .markdown-body table {
        display: block;
        width: 100%;
        overflow: auto;
    }

    .markdown-body table th {
        font-weight: 600;
    }

    .markdown-body table th,
    .markdown-body table td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
    }

    .markdown-body table tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;
    }

    .markdown-body table tr:nth-child(2n) {
        background-color: #f6f8fa;
    }

    .markdown-body img {
        max-width: 100%;
        box-sizing: content-box;
        background-color: #fff;
    }

    .markdown-body img[align=right] {
        padding-left: 20px;
    }

    .markdown-body img[align=left] {
        padding-right: 20px;
    }

    .markdown-body code {
        padding: 0;
        padding-top: 0.2em;
        padding-bottom: 0.2em;
        margin: 0;
        font-size: 85%;
        background-color: rgba(27,31,35,0.05);
        border-radius: 3px;
    }

    .markdown-body code::before,
    .markdown-body code::after {
        letter-spacing: -0.2em;
        content: "\00a0";
    }

    .markdown-body pre {
        word-wrap: normal;
    }

    .markdown-body pre>code {
        padding: 0;
        margin: 0;
        font-size: 100%;
        word-break: normal;
        white-space: pre;
        background: transparent;
        border: 0;
    }

    .markdown-body .highlight pre {
        margin-bottom: 0;
        word-break: normal;
    }

    .markdown-body .highlight pre,
    .markdown-body pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 3px;
    }

    .markdown-body pre code {
        display: inline;
        max-width: auto;
        padding: 0;
        margin: 0;
        overflow: visible;
        line-height: inherit;
        word-wrap: normal;
        background-color: transparent;
        border: 0;
    }

    .markdown-body pre code::before,
    .markdown-body pre code::after {
        content: normal;
    }

    .markdown-body kbd {
        display: inline-block;
        padding: 3px 5px;
        font: 11px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        line-height: 10px;
        color: #444d56;
        vertical-align: middle;
        background-color: #fafbfc;
        border: solid 1px #d1d5da;
        border-bottom-color: #c6cbd1;
        border-radius: 3px;
        box-shadow: inset 0 -1px 0 #c6cbd1;
    }

    .markdown-body .task-list-item input {
        margin: 0 0.2em 0.25em -1.6em;
        vertical-align: middle;
    }

    .markdown-body hr {
        border-bottom-color: #eee;
    }
</style>
