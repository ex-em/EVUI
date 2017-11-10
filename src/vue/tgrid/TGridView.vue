<template>
    <tgrid :gridInfo="gridInfo"
          :columns="gridColumns"
          :data="rowData">
    </tgrid>
</template>
<script>
    import tgrid from './TGrid.vue'

    export default {
        data () {

            let tempData = [];

            for (let ix = 0; ix < 5000; ix++) {
                tempData.push({checked: false, col2: ix+1,  col4: 'aa', col1: 'data'+(ix+1), col3: 'data_'+(ix+1), col5:'zz'});
            }

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
                    {dataIndex: 'col7', name: 'column7', width: 150, visible: true, type: 'string', draggable: true},
                    {dataIndex: 'col8', name: 'column8', width: 150, visible: true, type: 'string', draggable: true}
                ],
                rowData :
                    tempData

            }
        },
        components: {
            tgrid
        }
    }
</script>
<style></style>
