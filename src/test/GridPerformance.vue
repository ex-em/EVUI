<template>
    <div class="home">
        <div class="test">
            <h4>Example of the Grid</h4>
            <div>column :
                <button @click="generateColumn(5)">5 column</button>
                <button @click="generateColumn(10)">10 column</button>
                <button @click="generateColumn(20)">20 column</button>
            </div>
            <div>Record :
                <button @click="generateData(50000)">50k Records</button>
                <button @click="generateData(100000)">100k Records</button>
                <button @click="generateData(150000)">150k Records</button>
            </div>
            <div>
                <!--<input type="checkbox" :checked="useBuffer" @change="(val) => { useBuffer = val }">-->
                <!--<label>Data Buffer Size : <input type="number" :value="gridBufferSize" width="60" min="10" :readOnly="!useBuffer"/></label>-->
            </div>

            <grid :gridInfo="gridInfo"
                  :columns="gridColumns"
                  :data="rowData"
                  ref="grid"

                  :cellClick="onClick"
            >
            </grid>


        </div>
        <div class="result">
            <h4>Data Record :  {{ recordCount }}</h4>
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
            generateColumn(count = 5){
                let column = [
                    {dataIndex: 'column', name: 'column' ,      draggable: true, width: 20, visible: true, type: 'boolean', cellrender: 'checkbox'},
                    {dataIndex: 'column2', name: 'column2'    , draggable: true, width: 300, visible: true, type: 'string', cellrender: 'textbox'},
                    {dataIndex: 'column3', name: 'column3'    , draggable: true, width: 200, visible: true, type: 'number', cellrender: 'spinner', toFixed:2},
                    {dataIndex: 'column4', name: 'column4'    , draggable: true, width: 150, visible: true, type: 'string'},
                    {dataIndex: 'column5', name: 'column5'    , draggable: true, width: 150, visible: true, type: 'string'}
                ];

                for(let ix = column.length + 1; ix < count + 1; ix++){
                    column.push({
                        dataIndex: 'column' + ix,
                        name: 'column' + ix,
                        draggable: true,
                        width: 100,
                        visible: true,
                        type: 'string'
                    })
                }

                this.gridColumns = column;

                this.generateData()

            },
            generateData(count = 50000){
                let before = performance.now();
                let tempData = new Array(count);

                this.selectStore.length = 0;

                for (let ix = 0; ix < count; ix++) {
                    tempData[ix] = this.randomData(ix);
                }

                this.rowData = tempData;

                let after = performance.now();

                this.generateTime = Math.round(after - before);

                this.recordCount = count;

                return tempData;
            },
            randomData(index) {
                let row = {
                    column : Math.round(Math.random()) ? true : false,
                    column2 : 'index_' + index,
                    column3 : (Math.random() * 1000000).toFixed(3),
                    column4 : 'data_' + index,
                    column5 : 'vue_' + index + '@ex-em.com',
                };

                this.selectStore.push('data_' + index);

                for(let ix = 6; ix < this.gridColumns.length; ix++){
                    row[ 'column' + ix ] = 'column' + ix;
                }
                return row;
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
                recordCount: 15000,
                gridInfo: {
                    title : 'EVUI-Grid-Title',
                    width : 800,
                    height : 300,
                    useCheckbox: true,
                    useColumnResize: true,
                    useColumnFixing: true // 추후 Context 제공 여부
                },
                gridColumns: [],
                rowData : [],
                selectStore: []
            }
        },

        beforeMount() {
            setTimeout(this.generateColumn.bind(this,5), 1000);
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
