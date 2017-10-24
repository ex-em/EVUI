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
                    height : 500,
                    useCheckbox: true,
                    useReszie: true
                },
                gridColumns: [
                    {dataIndex: 'checked', name: 'CheckBox', width: 80, visible: true, type: 'checkbox'},
                    {dataIndex: 'col1', name: 'column1', width: 300, visible: true, type: 'string'},
                    {dataIndex: 'col2', name: 'column2', width: 200, visible: true, type: 'number'},
                    {dataIndex: 'col3', name: 'column3', width: 150, visible: true, type: 'string'},
                    {dataIndex: 'col4', name: 'column4', width: 150, visible: true, type: 'string'},
                    {dataIndex: 'col5', name: 'column5', width: 150, visible: true, type: 'string'}
                ],
                rowData : [
                    {checked: false, col1: 'data1', col2: 100, col3: 'data3', col4: 'aa', col5:'zz'},
                    {checked: false, col1: 'data4', col2: 200, col3: 'data1', col4: 'bb', col5:'xx'},
                    {checked: false, col1: 'data2', col2: 150, col3: 'data6', col4: 'ff', col5:'dd'},
                    {checked: false, col1: 'data7', col2: 300, col3: 'data4', col4: 'cc', col5:'ss'},
                    {checked: false, col1: 'data6', col2: 500, col3: 'data5', col4: 'dd', col5:'yy'},
                    {checked: false, col1: 'data5', col2: 220, col3: 'data2', col4: 'ee', col5:'ll'}
                ]
            }
        },
        components: {
            grid
        }
    }
</script>
<style></style>
