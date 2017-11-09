<template>
    <tgrid :gridInfo="gridInfo"
          :columns="gridColumns"
          :data="rowData"
           @test="test"
    >
    </tgrid>
</template>
<script>
    import tgrid from './TGrid.vue'

    export default {
        data () {
            return {
                gridInfo: {
                    title : 'EVUI-Grid-Title',
                    width : 600,
                    height : 300,
                    useCheckbox: false,
                    useColumnResize: true,
                    useColumnFixing: true // 추후 Context 제공 여부
                },
                gridColumns: [
                    {dataIndex: 'col1', name: 'column1', width: 300, visible: true, type: 'string', draggable: true},
                    {dataIndex: 'col2', name: 'column2', width: 200, visible: true, type: 'number', draggable: true},
                    {dataIndex: 'col3', name: 'column3', width: 150, visible: true, type: 'string', draggable: true},
                    {dataIndex: 'col4', name: 'column4', width: 150, visible: true, type: 'string', draggable: true},
                    {dataIndex: 'col5', name: 'column5', width: 150, visible: true, type: 'string', draggable: true},
                    {dataIndex: 'col6', name: 'column6', width: 150, visible: true, type: 'string', draggable: true},
                    {dataIndex: 'col7', name: 'column7', width: 150, visible: true, type: 'string', draggable: true}
//                    {dataIndex: 'col8', name: 'column8', width: 150, visible: true, type: 'string', draggable: true}
                ],
                rowData : [
                    {checked: false, col2: 100,  col4: 'aa', col1: 'data1', col3: 'data3', col5:'zz', col6:22, col7:11},
                    {checked: false, col2: 200,  col4: 'bb', col1: 'data4', col3: 'data1', col5:'xx', col6:22, col7:11},
                    {checked: false, col2: 150,  col4: 'ff', col1: 'data2', col3: 'data6', col5:'dd', col6:22, col7:11},
                    {checked: false, col2: 300,  col4: 'cc', col1: 'data7', col3: 'data4', col5:'ss', col6:22, col7:113},
                    {checked: false, col2: 500,  col4: 'dd', col1: 'data6', col3: 'data5', col5:'yy', col6:22, col7:11},
                    {checked: false, col2: 220,  col4: 'ee', col1: 'data5', col3: 'data2', col5:'ll', col6:22, col7:11},
                    {checked: false, col2: 100,  col4: 'aa', col1: 'data1', col3: 'data3', col5:'zz', col6:22, col7:11},
                    {checked: false, col2: 200,  col4: 'bb', col1: 'data4', col3: 'data1', col5:'xx', col6:22, col7:11},
                    {checked: false, col2: 150,  col4: 'ff', col1: 'data2', col3: 'data6', col5:'dd', col6:22, col7:11},
                    {checked: false, col2: 300,  col4: 'cc', col1: 'data7', col3: 'data4', col5:'ss', col6:22, col7:11},
                    {checked: false, col2: 500,  col4: 'dd', col1: 'data6', col3: 'data5', col5:'yy', col6:22, col7:113},
                    {checked: false, col2: 220,  col4: 'ee', col1: 'data5', col3: 'data2', col5:'ll', col6:22, col7:11},
                    {checked: false, col2: 100,  col4: 'aa', col1: 'data1', col3: 'data3', col5:'zz', col6:22, col7:11},
                    {checked: false, col2: 200,  col4: 'bb', col1: 'data4', col3: 'data1', col5:'xx', col6:22, col7:11},
                    {checked: false, col2: 150,  col4: 'ff', col1: 'data2', col3: 'data6', col5:'dd', col6:22, col7:11},
                    {checked: false, col2: 300,  col4: 'cc', col1: 'data7', col3: 'data4', col5:'ss', col6:22, col7:11},
                    {checked: false, col2: 500,  col4: 'dd', col1: 'data6', col3: 'data5', col5:'yy', col6:22, col7:113},
                    {checked: false, col2: 220,  col4: 'ee', col1: 'data5', col3: 'data2', col5:'ll', col6:22, col7:11},
                    {checked: false, col2: 100,  col4: 'aa', col1: 'data1', col3: 'data3', col5:'zz', col6:22, col7:11},
                    {checked: false, col2: 200,  col4: 'bb', col1: 'data4', col3: 'data1', col5:'xx', col6:22, col7:11},
                    {checked: false, col2: 150,  col4: 'ff', col1: 'data2', col3: 'data6', col5:'dd', col6:22, col7:11},
                    {checked: false, col2: 300,  col4: 'cc', col1: 'data7', col3: 'data4', col5:'ss', col6:22, col7:113},
                    {checked: false, col2: 500,  col4: 'dd', col1: 'data6', col3: 'data5', col5:'yy', col6:22, col7:11},
                    {checked: false, col2: 220,  col4: 'ee', col1: 'data5', col3: 'data2', col5:'ll', col6:22, col7:11}
                ]
            }
        },
        components: {
            tgrid
        },
        methods:{
            test(){
                console.log('test',arguments)
            }
        }
    }
</script>
<style></style>
