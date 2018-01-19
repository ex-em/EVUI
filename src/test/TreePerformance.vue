<template>
    <div class="home">
        <div class="test">
            <h4>Example of the Tree</h4>
            <div>Record :
                <button @click="generateData(1001)">1k Records</button>
                <button @click="generateData(10001)">10k Records</button>
            </div>
            <tree :title="'Evui-Tree-Title'"
                  :width="800"
                  :height="300"
                  :treeColumnId="'column1'"
                  :useCheckBox="true"
                  :useColumnResize="true"
                  :useFilter="false"

                  :columns="treeColumns"
                  :rows="treeData"
                  ref="tree">
            </tree>
        </div>
        <div class="result">
            <h4>Data Record :  {{ recordCount }}</h4>
            <h4>Data Generate :  {{ generateTime }} milli second</h4>
            <h4>Tree Data Parse : {{ checkTreeParseTime() }} milli second</h4>
            <h4>Render & Patch :  {{ checkRenderTime() }} milli second</h4>
        </div>
    </div>
</template>

<script>
    import tree from '../vue/tree/Tree.vue';

    export default {
        components: {
            tree
        },
        methods: {
            generateData(count = 1001){
                let before = performance.now();
                this.recordCount = 0;
                let tempData = new Array(count);

                for (let ix = 0; ix < count; ix++) {
                    tempData[ix] = {
                        'id' : ix,
                        'data' : this.randomData(ix)
                    };


                    if(ix === 1) {
                        tempData[ix].parentId = null;
                    }
                    else if(ix % 10 === 1) {
                        tempData[ix].parentId = null;
                    }
                    else if(ix % 10 === 7) {
                        tempData[ix].parentId = ix - 5;
                    }
                    else {
                        tempData[ix].parentId = ix - 1;
                    }

                    this.recordCount++;
                }
                tempData.splice(0,1);
                this.recordCount--;

                this.treeData = tempData;

                let after = performance.now();

                this.generateTime = Math.round(after - before);

                return tempData;
            },
            randomData(index) {

                return {
                    column1 : 'index_' + index,
                    column2 : 'data_'  + (index % 100),
                    column3 : Math.round(Math.random() * 1000000),
                    column4 : 'data_' + index
                }

            },

            checkRenderTime() {
                if(this.$refs.tree == null || this.$refs.tree.beforeUpdateTime == null || this.$refs.tree.updatedTime == null){
                    return 0;
                }

                return Math.round(this.$refs.tree.updatedTime - this.$refs.tree.beforeUpdateTime);
            },

            checkTreeParseTime() {
                if(this.$refs.tree == null || this.$refs.tree.beforeTreeParseTime == null || this.$refs.tree.updateTreeParseTime == null){
                    return 0;
                }

                return Math.round(this.$refs.tree.updateTreeParseTime - this.$refs.tree.beforeTreeParseTime);
            }
        },
        data () {

            return {
                useBuffer: true,
                treeBufferSize: 100,
                generateTime: 0,
                beforeUpdateTime: 0,
                updatedTime: 0,
                recordCount: 1000,
                treeInfo: {
                    title : 'Evui-Tree-Title',
                    width : 800,   // number or '%' (percent)
                    height : 300,    // number or '%' (percent)
                    treeColumnId: 'column1',
                    useColumnResize: true,
                    useCheckBox: true,
                    useFilter: false
                },
                treeColumns: [
                    {id: 'col1', dataIndex: 'column1', name: 'column1', width: 500, type: 'string',  draggable: true, visible: true},
                    {id: 'col2', dataIndex: 'column2', name: 'column2', width: 400, type: 'string',  draggable: true, visible: true},
                    {id: 'col3', dataIndex: 'column3', name: 'column3', width: 150, type: 'integer', draggable: true, visible: true},
                    {id: 'col4', dataIndex: 'column4', name: 'column4', width: 120, type: 'string',  draggable: true, visible: true}
                ],
                treeData : this.generateData()
            }
        },

        mounted() {
        }

    }
</script>

<style scoped>
    .home{
        top:0px;
        left:0px;
        width: 100%;
        height:100%;
        padding-left:20px;
    }

    .home > div{
        float: left;
        width: 50%;
    }
</style>
