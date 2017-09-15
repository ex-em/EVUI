<template>
    <grid :columns="gridColumns"
          :data="rowData">
    </grid>
</template>
<script>
    import grid from './Grid.vue'

    export default {
        data () {
            return {
                gridColumns: ['column1', 'column2', 'column3'],
                rowData : [
                    ['data1', 'data2', 'data3'],
                    ['data4', 'data4', 'data1'],
                    ['data2', 'data6', 'data2'],
                    ['data5', 'data7', 'data3']
                ]
            }
        },
        components: {
            grid
        }
    }
</script>
<style></style>
