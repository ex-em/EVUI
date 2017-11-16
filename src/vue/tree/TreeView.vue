<template>
    <tree :treeInfo="treeInfo"
          :columns="treeColumns"
          :rows="treeData">
    </tree>
</template>
<script>
    import tree from './Tree.vue'

    export default {
        data () {
            let tempData = [];

            for (let ix = 1; ix <= 2000; ix++) {
                tempData[ix] = {
                    'id' : ix,
                    'data' : {
                        'class_name' : 'test_class_' + ix,
                        'method_name' : 'test_method_' + (ix % 100),
                        'elapse_time' : Math.floor( (Math.random() * (100 - 1 + 1)) + 1 ),
                        'exec_count' : Math.floor( (Math.random() * (20 - 1 + 1)) + 1 )
                    }
                };
            }

            for(let jx=1, jxLen=tempData.length; jx<jxLen; jx++) {
                if(jx === 1) {
                    tempData[jx].parentId = null;
                }
                else if(jx % 10 === 1) {
                    tempData[jx].parentId = null;
                }
                else if(jx % 10 === 7) {
                    tempData[jx].parentId = jx - 5;
                }
                else {
                    tempData[jx].parentId = jx - 1;
                }

            }
            tempData.splice(0,1);


            return {
                // tree option & tree node data
                // first column set tree level
                treeInfo: {
                    title : 'tree-test-title',
                    width : 900,   // number or '%' (percent)
                    height : 300,    // number or '%' (percent)
                    treeColumnId: 'class_name',
                    useColumnResize: true,
                    useCheckBox: true,
                    useFilter: false
                },
                treeColumns: [
                    {id: 'col1', dataIndex: 'class_name',  name: '클래스명', width: 500, draggable: true, visible: true},
                    {id: 'col2', dataIndex: 'method_name', name: '메소드명', width: 400, draggable: true, visible: true},
                    {id: 'col3', dataIndex: 'elapse_time', name: '수행시간', width: 150, draggable: true, visible: true},
                    {id: 'col4', dataIndex: 'exec_count',  name: '수행건수', width: 120, draggable: true, visible: true}
                ],
                treeData : tempData
            }
        },
        components: {
            tree
        }
    }
</script>
<style></style>