<template>
    <div class="home">
        <div class="test">
            <h4>Example of the Grid</h4>
            <div>Record :
                <button @click="generateData(15000)">15k Records</button>
                <button @click="generateData(150000)">150k Records</button>
            </div>

            <div>
                <!--<input type="checkbox" :checked="useBuffer" @change="(val) => { useBuffer = val }">-->
                <label>Data Buffer Size : <input type="number" :value="gridBufferSize" width="60" min="10" :readOnly="!useBuffer"/></label>
            </div>

            <grid :gridInfo="gridInfo"
                  :columns="gridColumns"
                  :data="rowData"
                  ref="grid"
            >
            </grid>


        </div>
        <div class="result">
            <h4>Data Record :  {{ recodeCount }}</h4>
            <h4>Data Generate :  {{ generateTime }} milli second</h4>
            <h4>Render & Patch :  {{ checkRenderTime() }} milli second</h4>
        </div>

    </div>
</template>

<script>
    import grid from '../vue/grid/Grid.vue';

    export default {
        components: {
            grid
        },
        methods: {
            generateData(count = 15000){
                let before = performance.now();
                this.recodeCount = 0;
                let tempData = new Array(count);

                for (let ix = 0; ix < count; ix++) {
                    tempData[ix] = this.randomData(ix);
                    this.recodeCount++;
                }

                this.rowData = tempData;

                let after = performance.now();

                this.generateTime = Math.round(after - before);

                return tempData;
            },
            randomData(index) {
//                let recode = {};
//                let value;
//                for(let ix = 0, ixLen = this.gridColumns.length; ix < ixLen; ix++){
//                    if(this.gridColumns[ix].type == 'boolean'){
//                        value = Math.round(Math.random()) ? true : false;
//                    }else if(this.gridColumns[ix].type == 'number'){
//                        value = Math.round(Math.random() * 1000000);
//                    }else{
//                        value = 'index_' +  index;
//                    }
//                    recode[this.gridColumns[ix].dataIndex] = value;
//                }
                return {
                    column : Math.round(Math.random()) ? true : false,
                    column2 : 'index_' + index,
                    column3 : Math.round(Math.random() * 1000000),
                    column4 : 'data_' + index,
                    column5 : 'vue_' + index + '@ex-em.com',
                }

            },

            checkRenderTime() {
                if(this.$refs.grid == null || this.$refs.grid.beforeUpdateTime == null || this.$refs.grid.updatedTime == null){
                    return 0;
                }

                return Math.round(this.$refs.grid.updatedTime - this.$refs.grid.beforeUpdateTime);
            }
        },
        data () {

            return {
                useBuffer: true,
                gridBufferSize: 100,
                generateTime: 0,
                beforeUpdateTime: 0,
                updatedTime: 0,
                recodeCount: 15000,
                gridInfo: {
                    title : 'EVUI-Grid-Title',
                    width : 800,
                    height : 300,
                    useCheckbox: true,
                    useColumnResize: true,
                    useColumnFixing: true // 추후 Context 제공 여부
                },
                gridColumns: [
                    {dataIndex: 'column', name: 'column' ,      draggable: true, width: 20, visible: true, type: 'boolean', render: 'checkbox'},
                    {dataIndex: 'column2', name: 'column2'    , draggable: true, width: 300, visible: true, type: 'string', render: 'textbox'},
                    {dataIndex: 'column3', name: 'column3'    , draggable: true, width: 200, visible: true, type: 'number', render: 'spinner'},
                    {dataIndex: 'column4', name: 'column4'    , draggable: true, width: 150, visible: true, type: 'string', render: 'selectbox'},
                    {dataIndex: 'column5', name: 'column5'    , draggable: true, width: 150, visible: true, type: 'string'},
                ],
                rowData : this.generateData()
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
