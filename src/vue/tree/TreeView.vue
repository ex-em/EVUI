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
                    width : 1200,   // number or '%' (percent)
                    height: '100%',     // number or '%' (percent)
                    treeColumnId: 'class_name'
                },
                treeColumns: [
                    {id: 'col1', dataIndex: 'class_name',  name: '클래스명', width: 500, visible: true},
                    {id: 'col2', dataIndex: 'method_name', name: '메소드명', width: 400, visible: true},
                    {id: 'col3', dataIndex: 'elapse_time', name: '수행시간', width: 150, visible: true},
                    {id: 'col4', dataIndex: 'exec_count',  name: '수행건수', width: 120, visible: true}
                ],
                treeData : [
                    {'id': 1,  'parentId' : null,  show: true, expanded : true, data: {'class_name':'javax/servlet/http/HttpServlet',     'method_name':'service(HttpServletRequest, HttpServletResponse)', 'elapse_time':150.63,  'exec_count':1}},
                    {'id': 2,  'parentId' : 1,     show: true, expanded : true, data: {'class_name':'servlet/XmEtoEServlet',              'method_name':'doPost(HttpServletRequest, HttpServletResponse)',  'elapse_time':150.63,  'exec_count':1}},
                    {'id': 3,  'parentId' : 2,     show: true, expanded : true, data: {'class_name':'etoe/XmEtoEController',              'method_name':'execute()',                                        'elapse_time':150.629, 'exec_count':1}},
                    {'id': 4,  'parentId' : 3,     show: true, expanded : true, data: {'class_name':'etoe/conn/XmConnect',                'method_name':'startNoThread()',                                  'elapse_time':149.868, 'exec_count':1}},
                    {'id': 5,  'parentId' : 4,     show: true, expanded : true, data: {'class_name':'etoe/conn/client/http/XmHttpClient', 'method_name':'connect(String, String)',                          'elapse_time':149.868, 'exec_count':1}},
                    {'id': 6,  'parentId' : 5,     show: true, expanded : true, data: {'class_name':'javax/net/ssl/SSLContext',           'method_name':'getInstance(String)',                              'elapse_time':0.001,   'exec_count':1}},
                    {'id': 7,  'parentId' : 5,     show: true, expanded : true, data: {'class_name':'HTTP',                               'method_name':'call',                                             'elapse_time':149.856, 'exec_count':1}},
                    {'id': 8,  'parentId' : 3,     show: true, expanded : true, data: {'class_name':'etoe/txn/XmTxn',                     'method_name':'txnSwitch()',                                      'elapse_time':0.76,    'exec_count':1}},
                    {'id': 9,  'parentId' : 8,     show: true, expanded : true, data: {'class_name':'etoe/txn/model/SimpleMinSleep',      'method_name':'execute()',                                        'elapse_time':0.76,    'exec_count':1}},
                    {'id': 10, 'parentId' : 9,     show: true, expanded : true, data: {'class_name':'util/XmSleep',                       'method_name':'random(int, int)',                                 'elapse_time':0.76,    'exec_count':1}},
                    {'id': 14, 'parentId' : null,  show: true, expanded : true, data: {'class_name':'javax/servlet/http/HttpServlet',     'method_name':'service(HttpServletRequest, HttpServletResponse)', 'elapse_time':150.63,  'exec_count':1}},
                    {'id': 15, 'parentId' : 14,    show: true, expanded : true, data: {'class_name':'servlet/XmEtoEServlet',              'method_name':'doPost(HttpServletRequest, HttpServletResponse)',  'elapse_time':150.63,  'exec_count':1}},
                    {'id': 16, 'parentId' : 15,    show: true, expanded : true, data: {'class_name':'etoe/XmEtoEController',              'method_name':'execute()',                                        'elapse_time':150.629, 'exec_count':1}},
                    {'id': 17, 'parentId' : 16,    show: true, expanded : true, data: {'class_name':'etoe/conn/XmConnect',                'method_name':'startNoThread()',                                  'elapse_time':149.868, 'exec_count':1}},
                    {'id': 18, 'parentId' : 17,    show: true, expanded : true, data: {'class_name':'etoe/conn/client/http/XmHttpClient', 'method_name':'connect(String, String)',                          'elapse_time':149.868, 'exec_count':1}},
                    {'id': 19, 'parentId' : 18,    show: true, expanded : true, data: {'class_name':'javax/net/ssl/SSLContext',           'method_name':'getInstance(String)',                              'elapse_time':0.001,   'exec_count':1}},
                    {'id': 20, 'parentId' : 18,    show: true, expanded : true, data: {'class_name':'HTTP',                               'method_name':'call',                                             'elapse_time':149.856, 'exec_count':1}},
                    {'id': 21, 'parentId' : 18,    show: true, expanded : true, data: {'class_name':'etoe/txn/XmTxn',                     'method_name':'txnSwitch()',                                      'elapse_time':0.76,    'exec_count':1}},
                    {'id': 22, 'parentId' : 21,    show: true, expanded : true, data: {'class_name':'etoe/txn/model/SimpleMinSleep',      'method_name':'execute()',                                        'elapse_time':0.76,    'exec_count':1}},
                    {'id': 23, 'parentId' : 22,    show: true, expanded : true, data: {'class_name':'util/XmSleep',                       'method_name':'random(int, int)',                                 'elapse_time':0.76,    'exec_count':1}},
                    {'id': 27, 'parentId' : null,  show: true, expanded : true, data: {'class_name':'javax/servlet/http/HttpServlet',     'method_name':'service(HttpServletRequest, HttpServletResponse)', 'elapse_time':150.63,  'exec_count':1}},
                    {'id': 28, 'parentId' : 27,    show: true, expanded : true, data: {'class_name':'servlet/XmEtoEServlet',              'method_name':'doPost(HttpServletRequest, HttpServletResponse)',  'elapse_time':150.63,  'exec_count':1}},
                    {'id': 29, 'parentId' : 28,    show: true, expanded : true, data: {'class_name':'etoe/XmEtoEController',              'method_name':'execute()',                                        'elapse_time':150.629, 'exec_count':1}},
                    {'id': 30, 'parentId' : 29,    show: true, expanded : true, data: {'class_name':'etoe/conn/XmConnect',                'method_name':'startNoThread()',                                  'elapse_time':149.868, 'exec_count':1}},
                    {'id': 31, 'parentId' : 30,    show: true, expanded : true, data: {'class_name':'etoe/conn/client/http/XmHttpClient', 'method_name':'connect(String, String)',                          'elapse_time':149.868, 'exec_count':1}},
                    {'id': 32, 'parentId' : 31,    show: true, expanded : true, data: {'class_name':'javax/net/ssl/SSLContext',           'method_name':'getInstance(String)',                              'elapse_time':0.001,   'exec_count':1}},
                    {'id': 33, 'parentId' : 31,    show: true, expanded : true, data: {'class_name':'HTTP',                               'method_name':'call',                                             'elapse_time':149.856, 'exec_count':1}},
                    {'id': 34, 'parentId' : 28,    show: true, expanded : true, data: {'class_name':'etoe/txn/XmTxn',                     'method_name':'txnSwitch()',                                      'elapse_time':0.76,    'exec_count':1}},
                    {'id': 35, 'parentId' : 34,    show: true, expanded : true, data: {'class_name':'etoe/txn/model/SimpleMinSleep',      'method_name':'execute()',                                        'elapse_time':0.76,    'exec_count':1}},
                    {'id': 36, 'parentId' : 35,    show: true, expanded : true, data: {'class_name':'util/XmSleep',                       'method_name':'random(int, int)',                                 'elapse_time':0.76,    'exec_count':1}}
                ]
            }
        },
        components: {
            tree
        }
    }
</script>
<style></style>