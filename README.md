# EVUI

## Install

Simply run `npm install evui --save`

Or if you want to use it directly in the browser add

```html
<script src="https://unpkg.com/evui@0.1.2/dist/evui.js"></script>
```

### Browser
You can use `evui` directly in the browser without any build setup. You also need to add the evui CDN script.

You can then simply use it your app:

```html
<!DOCTYPE html>
<html lang="en">
<head>   
    <meta charset="UTF-8">
    <script src="https://unpkg.com/vue/dist/vue.js"></script>
    <script type="https://unpkg.com/evui@0.1.2/dist/evui.js"></script>
    
    <title>EVUI</title>
</head>
<body>
    <div id="evui">
        <grid :gridInfo="gridInfo"
              :columns="gridColumns"
            :data="rowData">
        </grid>
    <div>
    <script type="text/javascript">
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
    </script>
</body>

```

### Webpack 2
If you're using Webpack 2 it will automatically use the `jsnext:main` / `module` entry point.

## How to use

You need to import the component.
You can import the whole package.

Use it in your vue app.

```javascript
import Vue from 'vue'
import evui from 'evui'

Vue.use(evui)
```

```javascript
<template>
    <grid :gridInfo="gridInfo"
          :columns="gridColumns"
          :data="rowData">
    </grid>
</template>
<script>
    export default {
        data () {
            let tempData = [];

            for (let ix = 0; ix < 5000; ix++) {
                tempData.push({checked: false,  col2: ix+1,  col4: 'aa', col1: 'data'+(ix+1), col3: 'data_'+(ix+1), col5:'zz', col6:randomNumber(30), col7:randomNumber(10), col8:randomNumber(100)});
            }

            //1~n 랜덤 숫자 리턴
            function randomNumber(n){
                return Math.floor(Math.random() * n) + 1
            }

            return {
                gridInfo: {
                    title : 'EVUI-Grid-Title',
                    width : 800,
                    height : 300,
                    useCheckbox: true,
                    useColumnResize: true,
                    useColumnFixing: true // 추후 Context 제공 여부
                },
                gridColumns: [
                    {dataIndex: 'checked', name: 'column2' , draggable: false, width: 20, visible: true, type: 'number', render: 'checkbox'},
                    {dataIndex: 'col1', name: 'column1'    , draggable: true, width: 300, visible: true, type: 'string', render: 'textbox', filter: 'text'},
                    {dataIndex: 'col2', name: 'column2'    , draggable: true, width: 200, visible: true, type: 'number', render: 'spinner', filter: 'text'},
                    {dataIndex: 'col3', name: 'column3'    , draggable: true, width: 150, visible: true, type: 'string', render: 'selectbox', filter: 'text'},
                    {dataIndex: 'col4', name: 'column4'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                    {dataIndex: 'col5', name: 'column5'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                    {dataIndex: 'col6', name: 'column6'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                    {dataIndex: 'col7', name: 'column7'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                    {dataIndex: 'col8', name: 'column8'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                ],
                rowData : tempData
            }
        }
    }
</script>
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Contributing

1. Fork it ( https://github.com/ex-em/EVUI/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

This software is distributed under [MIT license](LICENSE.txt).