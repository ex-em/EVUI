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
                    height : 500
                },
                gridColumns: [
                    {cId: 'col1', cName: 'column1', cWidth: 300, cVisible: true},
                    {cId: 'col2', cName: 'column2', cWidth: 200, cVisible: true},
                    {cId: 'col3', cName: 'column3', cWidth: 150, cVisible: true}
                ],
                rowData : [
                    ['data1', 100, 'data3'],
                    ['data4', 200, 'data1'],
                    ['data2', 150, 'data2'],
                    ['data5', 300, 'data3']
                ]
            }
        },
        components: {
            grid
        }
    }
</script>
<style></style>
