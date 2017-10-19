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
                    {cId: 'col1', cName: 'column1', cWidth: 300, cVisible: true, cType: 'string'},
                    {cId: 'col2', cName: 'column2', cWidth: 200, cVisible: true, cType: 'number'},
                    {cId: 'col3', cName: 'column3', cWidth: 150, cVisible: true, cType: 'string'},
                    {cId: 'col4', cName: 'column4', cWidth: 150, cVisible: true, cType: 'string'},
                    {cId: 'col5', cName: 'column5', cWidth: 150, cVisible: true, cType: 'string'}
                ],
                rowData : [
                    ['data1', 100, 'data3', 'aa', 'zz'],
                    ['data4', 200, 'data1', 'bb', 'xx'],
                    ['data2', 150, 'data6', 'ff', 'dd'],
                    ['data7', 300, 'data4', 'cc', 'ss'],
                    ['data6', 500, 'data5', 'dd', 'yy'],
                    ['data5', 220, 'data2', 'ee', 'll']
                ]
            }
        },
        components: {
            grid
        }
    }
</script>
<style></style>
