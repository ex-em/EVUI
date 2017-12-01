<template>
    <grid :title="'EVUI-Grid-Title'"
          :width="800"
          :height="300"
          :useColumnResize="true"
          :columns="gridColumns"
          :data="rowData"
          @cellClick="onCellClick"
          @cellDblClick="onCellDblClick"
          @rowClick="onRowClick"
          @rowDblClick="onRowDblClick"
          @sortChange="onSortChange"
    >
    </grid>
</template>
<script>
    import grid from './Grid.vue'

    export default {
        methods: {
            onCellClick(){
                console.log('grid cell click event: ', arguments);
            },
            onCellDblClick(){
                console.log('grid cell double click event: ', arguments);
            },
            onRowClick(){
                console.log('grid row click event: ', arguments);
            },
            onRowDblClick(){
                console.log('grid row double click event: ', arguments);
            },
            onSortChange(){
                console.log('grid sort change event: ', arguments);
            }

        },
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
                gridColumns: [
                    {dataIndex: 'checked', name: 'column2' , draggable: false, width: 20, visible: true, type: 'number', cellrender: 'checkbox'},
                    {dataIndex: 'col1', name: 'column1'    , draggable: true, width: 300, visible: true, type: 'string', cellrender: 'textbox', filter: 'text'},
                    {dataIndex: 'col2', name: 'column2'    , draggable: true, width: 200, visible: true, type: 'number', cellrender: 'spinner', filter: 'text'},
                    {dataIndex: 'col3', name: 'column3'    , draggable: true, width: 150, visible: true, type: 'string', cellrender: 'selectbox', filter: 'text'},
                    {dataIndex: 'col4', name: 'column4'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                    {dataIndex: 'col5', name: 'column5'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                    {dataIndex: 'col6', name: 'column6'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                    {dataIndex: 'col7', name: 'column7'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
                    {dataIndex: 'col8', name: 'column8'    , draggable: true, width: 150, visible: true, type: 'string', filter: 'text'},
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
