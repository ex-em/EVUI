<template>
    <grid :gridInfo="gridInfo"
          :columns="gridColumns"
          :data="rowData">
    </grid>
</template>
<script>
    import grid from './Grid.vue'

    export default {
        data () {
            let tempData = [];

            for (let ix = 0; ix < 5000; ix++) {
                tempData.push({checked: false, col2: ix+1,  col4: 'aa', col1: 'data'+(ix+1), col3: 'data_'+(ix+1), col5:'zz', col6:'66', col7:'77', col8:'88'});
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
                    {dataIndex: 'checked', name: 'column2' , draggable: true, width: 20, visible: true, type: 'number', render: 'checkbox'},
                    {dataIndex: 'col1', name: 'column1'    , draggable: true, width: 300, visible: true, type: 'string', render: 'textbox'},
                    {dataIndex: 'col2', name: 'column2'    , draggable: true, width: 200, visible: true, type: 'number', render: 'spinner'},
                    {dataIndex: 'col3', name: 'column3'    , draggable: true, width: 150, visible: true, type: 'string', render: 'selectbox'},
                    {dataIndex: 'col4', name: 'column4'    , draggable: true, width: 150, visible: true, type: 'string'},
                    {dataIndex: 'col5', name: 'column5'    , draggable: true, width: 150, visible: true, type: 'string'}
                ],
                rowData : tempData
            }
        },
        components: {
            grid
        }
    }
</script>
<style></style>
