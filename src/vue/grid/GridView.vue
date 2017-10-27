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
            return {
                gridInfo: {
                    title : 'EVUI-Grid-Title',
                    width : 1500,
                    height : 300,
                    useCheckbox: true,
                    useColumnResize: true,
                    useColumnFixing: true // 추후 Context 제공 여부
                },
                gridColumns: [
                    {dataIndex: 'col1', name: 'column1', width: 300, visible: true, type: 'string'},
                    {dataIndex: 'col2', name: 'column2', width: 200, visible: true, type: 'number'},
                    {dataIndex: 'col3', name: 'column3', width: 150, visible: true, type: 'string'},
                    {dataIndex: 'col4', name: 'column4', width: 150, visible: true, type: 'string'},
                    {dataIndex: 'col5', name: 'column5', width: 150, visible: true, type: 'string'}
                ],
                rowData : [
                    {checked: false, col2: 100,  col4: 'aa', col1: 'data1', col3: 'data3', col5:'zz'},
                    {checked: false, col2: 200,  col4: 'bb', col1: 'data4', col3: 'data1', col5:'xx'},
                    {checked: false, col2: 150,  col4: 'ff', col1: 'data2', col3: 'data6', col5:'dd'},
                    {checked: false, col2: 300,  col4: 'cc', col1: 'data7', col3: 'data4', col5:'ss'},
                    {checked: false, col2: 500,  col4: 'dd', col1: 'data6', col3: 'data5', col5:'yy'},
                    {checked: false, col2: 220,  col4: 'ee', col1: 'data5', col3: 'data2', col5:'ll'},
                    {checked: false, col2: 100,  col4: 'aa', col1: 'data1', col3: 'data3', col5:'zz'},
                    {checked: false, col2: 200,  col4: 'bb', col1: 'data4', col3: 'data1', col5:'xx'},
                    {checked: false, col2: 150,  col4: 'ff', col1: 'data2', col3: 'data6', col5:'dd'},
                    {checked: false, col2: 300,  col4: 'cc', col1: 'data7', col3: 'data4', col5:'ss'},
                    {checked: false, col2: 500,  col4: 'dd', col1: 'data6', col3: 'data5', col5:'yy'},
                    {checked: false, col2: 220,  col4: 'ee', col1: 'data5', col3: 'data2', col5:'ll'},
                    {checked: false, col2: 100,  col4: 'aa', col1: 'data1', col3: 'data3', col5:'zz'},
                    {checked: false, col2: 200,  col4: 'bb', col1: 'data4', col3: 'data1', col5:'xx'},
                    {checked: false, col2: 150,  col4: 'ff', col1: 'data2', col3: 'data6', col5:'dd'},
                    {checked: false, col2: 300,  col4: 'cc', col1: 'data7', col3: 'data4', col5:'ss'},
                    {checked: false, col2: 500,  col4: 'dd', col1: 'data6', col3: 'data5', col5:'yy'},
                    {checked: false, col2: 220,  col4: 'ee', col1: 'data5', col3: 'data2', col5:'ll'},
                    {checked: false, col2: 100,  col4: 'aa', col1: 'data1', col3: 'data3', col5:'zz'},
                    {checked: false, col2: 200,  col4: 'bb', col1: 'data4', col3: 'data1', col5:'xx'},
                    {checked: false, col2: 150,  col4: 'ff', col1: 'data2', col3: 'data6', col5:'dd'},
                    {checked: false, col2: 300,  col4: 'cc', col1: 'data7', col3: 'data4', col5:'ss'},
                    {checked: false, col2: 500,  col4: 'dd', col1: 'data6', col3: 'data5', col5:'yy'},
                    {checked: false, col2: 220,  col4: 'ee', col1: 'data5', col3: 'data2', col5:'ll'}
                ]
            }
        },
        components: {
            grid
        }
    }
</script>
<style></style>
