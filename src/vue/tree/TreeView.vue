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
            return {
                // tree option & tree node data
                // first column set tree level
                treeInfo: {
                    title : 'tree-test-title',
                    width : 1080,   // number or '%' (percent)
                    height: 500     // number or '%' (percent)
                },
                treeColumns: [
                    {cId: 'lvl',  cName: 'lvl',         cWidth: 100, cVisible: false},  // min value : 1
                    {cId: 'col1', cName: 'class_name',  cWidth: 500, cVisible: true, treecolumn: true},
                    {cId: 'col2', cName: 'method_name', cWidth: 400, cVisible: true},
                    {cId: 'col3', cName: 'elapse_time', cWidth: 100, cVisible: true},
                    {cId: 'col4', cName: 'exec_count',  cWidth: 80, cVisible: true}
                ],
                treeData : [
                    [1, 'javax/servlet/http/HttpServlet', 'service(HttpServletRequest, HttpServletResponse)', 150.63, 1],
                    [2, 'servlet/XmEtoEServlet', 'doPost(HttpServletRequest, HttpServletResponse)', 150.63, 1],
                    [3, 'etoe/XmEtoEController', 'execute()', 150.629, 1],
                    [4, 'etoe/conn/XmConnect', 'startNoThread()', 149.868, 3],
                    [5, 'etoe/conn/client/http/XmHttpClient', 'connect(String, String)', 149.868, 3],
                    [6, 'javax/net/ssl/SSLContext', 'getInstance(String)', 0.001, 3],
                    [6, 'HTTP', 'call', 149.856, 3],
                    [4, 'etoe/txn/XmTxn', 'txnSwitch()', 0.76, 1],
                    [5, 'etoe/txn/model/SimpleMinSleep', 'execute()', 0.76, 1],
                    [6, 'util/XmSleep', 'random(int, int)', 0.76, 1]
                ]
            }
        },
        components: {
            tree
        }
    }
</script>
<style></style> currlevel = 6  ix는 xmtxn