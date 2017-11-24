<template>
    <div>
        <div style="height:450px; margin: 0px;">
            <div style="float: left; margin:15px; font-size: 0.75rem">
                <span>1-Series Data Record : </span>
                <button @click="dataRecordChange(1000, 1)">1K</button>
                <button @click="dataRecordChange(5000, 1)">5K</button>
                <button @click="dataRecordChange(10000, 1)">10K</button>
            </div>
            <div style="float:left; margin:15px; font-size: 0.75rem">
                <span>5-Series Data Record : </span>
                <button @click="dataRecordChange(1000, 5)">1K</button>
                <button @click="dataRecordChange(5000, 5)">5K</button>
                <button @click="dataRecordChange(10000, 5)">10K</button>
            </div>
            <div style="float: left; margin:15px; font-size: 0.75rem">
                <span>10-Series Data Record : </span>
                <button @click="dataRecordChange(1000, 10)">1K</button>
                <button @click="dataRecordChange(5000, 10)">5K</button>
                <button @click="dataRecordChange(10000, 10)">10K</button>
            </div>

            <chart
                ref="stress-line"
                :data="Line.chartData"
                :options="Line.chartOptions">
            </chart>

            <div style="float:right; width:15%; padding-top:2%; font-size: 0.8rem">
                <span>Performance</span>
                <ul>
                    <li>Data Parsing :
                        <span>{{ parseTime }}</span> ms
                    </li>
                    <li>Render :
                        <span>{{ renderTime }}</span> ms
                    </li>
                </ul>
            </div>
        </div>

        <div style="height:450px;">
            <div style="float: left">
                <div style="float: left; margin:15px; font-size: 0.75rem">
                    <span>1-Series Data Record : </span>
                    <button @click="dataRecordChange2(1000, 1)">1K</button>
                    <button @click="dataRecordChange2(5000, 1)">5K</button>
                    <button @click="dataRecordChange2(10000, 1)">10K</button>
                </div>
                <div style="float:left; margin:15px; font-size: 0.75rem">
                    <span>5-Series Data Record : </span>
                    <button @click="dataRecordChange2(1000, 5)">1K</button>
                    <button @click="dataRecordChange2(5000, 5)">5K</button>
                    <button @click="dataRecordChange2(10000, 5)">10K</button>
                </div>
                <div style="float: left; margin:15px; font-size: 0.75rem">
                    <span>10-Series Data Record : </span>
                    <button @click="dataRecordChange2(1000, 10)">1K</button>
                    <button @click="dataRecordChange2(5000, 10)">5K</button>
                    <button @click="dataRecordChange2(10000, 10)">10K</button>
                </div>
            </div>
            <chart
                ref="stress-scatter"
                :data="Scatter.chartData"
                :options="Scatter.chartOptions">
            </chart>

            <div style="float:right; width:15%; padding-top:2%; font-size: 0.8rem">
                <span>Performance</span>
                <ul>
                    <li>Data Parsing :
                        <span>{{ parseTime2 }}</span> ms
                    </li>
                    <li>Render :
                        <span>{{ renderTime2 }}</span> ms
                    </li>
                </ul>
            </div>
        </div>

        <br/>

        <div>
            <div style="margin:15px; font-size: 0.75rem;">
                <span>Legend Position :</span>
                <button @click="legendPositionChange('top')">Top</button>
                <button @click="legendPositionChange('right')">Right</button>
                <button @click="legendPositionChange('bottom')">Bottom</button>
            </div>

            <chart
                ref="line"
                :data="Line.chartData2"
                :options="Line.chartOptions2">
            </chart>

            <chart
                ref="scatter"
                :data="Scatter.chartData2"
                :options="Scatter.chartOptions2">
            </chart>

            <chart
                ref="bar"
                :data="Bar.chartData"
                :options="Bar.chartOptions">
            </chart>

            <chart
                ref="column"
                :data="Column.chartData"
                :options="Column.chartOptions">
            </chart>

            <chart
                ref="stackBar"
                :data="StackBar.chartData"
                :options="StackBar.chartOptions">
            </chart>

            <chart
                ref="pie"
                :data="Pie.chartData"
                :options="Pie.chartOptions">
            </chart>
        </div>
    </div>
</template>
<script>
    import chart from '../vue/chartT/Chart.vue'
    import mock0 from '../mock/chart/0.json'

    export default {
        data () {
            let startTime = new Date()

            let rslt = mock0.map(
                v => [v.n01, v.n02, v.n03, v.n04, v.n05, v.n06, v.n07, v.n08, v.n09, v.n10, v.n11, v.n12])

            let parseTime = new Date()

            return {
                parseTime: parseTime - startTime,
                renderTime: '-',
                parseTime2: parseTime - startTime,
                renderTime2: '-',
                minVal: 143134652600,
                Bar: {
                    chartData: {
                        categories: ['Jan', 'Feb'],
                        series: rslt.slice(0, 1),
                    },
                    chartOptions: {
                        type: 'Bar',
                        width: '33%',
                        height: '400px',
                        isHorizontalBar: true,
                        seriesBarDistance: 10,
                        axisX: {
                            showGrid: true,
                            labelAlign: 'between',
                        },
                        axisY: {
                            divisor: 5,
                            showGrid: true,
                        },
                    },
                },

                Column: {
                    chartData: {
                        categories: ['Jan', 'Feb'],
                        series: rslt.slice(0, 4),
                    },
                    chartOptions: {
                        type: 'Bar',
                        width: '33%',
                        height: '400px',
                        isHorizontalBar: true,
                        seriesBarDistance: 10,
                        axisX: {
                            showGrid: true,
                            labelAlign: 'between',
                        },
                        axisY: {
                            divisor: 5,
                            showGrid: true,
                        },
                    },
                },

                StackBar: {
                    chartData: {
                        categories: ['Jan', 'Feb'],
                        series: rslt.slice(0, 4),
                    },
                    chartOptions: {
                        type: 'Bar',
                        width: '33%',
                        height: '400px',
                        isHorizontalBar: true,
                        isStacked: true,
                        seriesBarDistance: 10,
                        axisX: {
                            showGrid: true,
                            labelAlign: 'between',
                        },
                        axisY: {
                            divisor: 5,
                            showGrid: true,
                        },
                    },
                },

                Line: {
                    chartData: {
                        series: [
                            {
                                data: [
                                    {x: new Date(143134652600), y: rslt[0][0]},
                                    {x: new Date(143136652600), y: rslt[0][1]},
                                    {x: new Date(143138652600), y: rslt[0][2]},
                                    {x: new Date(143140652600), y: rslt[0][3]},
                                    {x: new Date(143144652600), y: rslt[0][4]},
                                ],
                            },
                            {
                                data: [
                                    {x: new Date(143134652600), y: rslt[1][0]},
                                    {x: new Date(143136652600), y: rslt[1][1]},
                                    {x: new Date(143138652600), y: rslt[1][2]},
                                    {x: new Date(143140652600), y: rslt[1][3]},
                                    {x: new Date(143144652600), y: rslt[1][4]},
                                ],
                            },
                            {
                                data: [
                                    {x: new Date(143134652600), y: rslt[2][0]},
                                    {x: new Date(143136652600), y: rslt[2][1]},
                                    {x: new Date(143138652600), y: rslt[2][2]},
                                    {x: new Date(143140652600), y: rslt[2][3]},
                                    {x: new Date(143144652600), y: rslt[2][4]},
                                ],
                            }
                        ],
                    },
                    chartOptions: {
                        type: 'Line',
                        width: '85%',
                        height: '400px',
                        lineWidth: '2px',
                        pointSize: '5px',
                        axisX: {
                            divisor: 5,
                            showGrid: true,
                            labelAlign: 'line',
                            tickFormat: function (value) {
                                let date

                                if (!value) {
                                    date = new Date()
                                }
                                else {
                                    date = new Date(value)
                                }

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
                            },
                        },
                        axisY: {
                            showGrid: true,
                            high: 100,
                        },
                        tooltip: {
                            xFormat: function (value) {
                                let date = new Date(parseInt(value))

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
                                    (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
                            },
                        },
                    },

                    chartData2: {
                        series: [
                            {
                                data: [
                                    {x: new Date(143134652600), y: rslt[0][0]},
                                    {x: new Date(143234652600), y: rslt[0][1]},
                                    {x: new Date(143340052600), y: rslt[0][2]},
                                    {x: new Date(143366652600), y: rslt[0][3]},
                                    {x: new Date(143410652600), y: rslt[0][4]},
                                    {x: new Date(143508652600), y: rslt[0][5]},
                                    {x: new Date(143569652600), y: rslt[0][6]},
                                    {x: new Date(143579652600), y: rslt[0][7]},
                                ],
                            },
                            {
                                data: [
                                    {x: new Date(143134652600), y: rslt[1][0]},
                                    {x: new Date(143234652600), y: rslt[1][1]},
                                    {x: new Date(143334652600), y: rslt[1][2]},
                                    {x: new Date(143384652600), y: rslt[1][3]},
                                    {x: new Date(143568652600), y: rslt[1][4]},
                                ],
                            },
                        ],
                    },
                    chartOptions2: {
                        type: 'Line',
                        width: '33%',
                        height: '400px',
                        axisX: {
                            divisor: 5,
                            showGrid: true,
                            labelAlign: 'line',
                            tickFormat: function (value) {
                                let date

                                if (!value) {
                                    date = new Date()
                                }
                                else {
                                    date = new Date(value)
                                }

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
                            },
                        },
                        axisY: {
                            showGrid: true,
                            high: 100,
                        },
                        tooltip: {
                            xFormat: function (value) {
                                let date = new Date(parseInt(value))

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
                                    (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
                            },
                        },

                    },
                },

                Scatter: {
                    chartData: {
                        series: [
                            {
                                data: [
                                    {x: new Date(143134652600), y: 53},
                                    {x: new Date(143234652600), y: 40},
                                    {x: new Date(143340052600), y: 45},
                                    {x: new Date(143366652600), y: 40},
                                    {x: new Date(143410652600), y: 20},
                                    {x: new Date(143508652600), y: 32},
                                    {x: new Date(143569652600), y: 18},
                                    {x: new Date(143579652600), y: 11},
                                    {x: new Date(143134652600), y: 53},
                                    {x: new Date(143234652600), y: 35},
                                    {x: new Date(143334652600), y: 30},
                                    {x: new Date(143384652600), y: 30},
                                    {x: new Date(143568652600), y: 10},
                                ],
                            },
                            {
                                data: [
                                    {x: new Date(143134652600), y: 50},
                                    {x: new Date(143234652600), y: 30},
                                    {x: new Date(143340052600), y: 20},
                                    {x: new Date(143366652600), y: 10},
                                    {x: new Date(143410652600), y: 15},
                                    {x: new Date(143508652600), y: 25},
                                    {x: new Date(143569652600), y: 35},
                                    {x: new Date(143579652600), y: 45},
                                    {x: new Date(143134652600), y: 55},
                                    {x: new Date(143234652600), y: 51},
                                    {x: new Date(143334652600), y: 41},
                                    {x: new Date(143384652600), y: 31},
                                    {x: new Date(143568652600), y: 21},
                                ],
                            },
                            {
                                data: [
                                    {x: new Date(143134652600), y: 53},
                                    {x: new Date(143234652600), y: 40},
                                    {x: new Date(143340052600), y: 45},
                                    {x: new Date(143366652600), y: 40},
                                    {x: new Date(143410652600), y: 20},
                                    {x: new Date(143508652600), y: 32},
                                    {x: new Date(143569652600), y: 18},
                                    {x: new Date(143579652600), y: 11},
                                    {x: new Date(143134652600), y: 53},
                                    {x: new Date(143234652600), y: 35},
                                    {x: new Date(143334652600), y: 30},
                                    {x: new Date(143384652600), y: 30},
                                    {x: new Date(143568652600), y: 10},
                                ],
                            }
                        ],
                    },
                    chartOptions: {
                        type: 'Line',
                        width: '85%',
                        height: '400px',
                        isScatter: true,
                        pointSize: '8px',
                        axisX: {
                            divisor: 5,
                            showGrid: true,
                            labelAlign: 'line',
                            tickFormat: function (value) {
                                let date

                                if (!value) {
                                    date = new Date()
                                }
                                else {
                                    date = new Date(value)
                                }

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
                            },
                        },
                        axisY: {
                            showGrid: true,
                        },
                        tooltip: {
                            xFormat: function (value) {
                                let date = new Date(parseInt(value))

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
                                    (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
                            },
                        },
                    },

                    chartData2: {
                        series: [
                            {
//                                name: 'series-1',
                                data: [
                                    {x: new Date(143134652600), y: 53},
                                    {x: new Date(143234652600), y: 40},
                                    {x: new Date(143340052600), y: 45},
                                    {x: new Date(143366652600), y: 40},
                                    {x: new Date(143410652600), y: 20},
                                    {x: new Date(143508652600), y: 32},
                                    {x: new Date(143569652600), y: 18},
                                    {x: new Date(143579652600), y: 11},
                                    {x: new Date(143134652600), y: 53},
                                    {x: new Date(143234652600), y: 35},
                                    {x: new Date(143334652600), y: 30},
                                    {x: new Date(143384652600), y: 30},
                                    {x: new Date(143568652600), y: 10},
                                ],
                            },
                            {
//                                name: 'series-2',
                                data: [
                                    {x: new Date(143134652600), y: 50},
                                    {x: new Date(143234652600), y: 30},
                                    {x: new Date(143340052600), y: 20},
                                    {x: new Date(143366652600), y: 10},
                                    {x: new Date(143410652600), y: 15},
                                    {x: new Date(143508652600), y: 25},
                                    {x: new Date(143569652600), y: 35},
                                    {x: new Date(143579652600), y: 45},
                                    {x: new Date(143134652600), y: 55},
                                    {x: new Date(143234652600), y: 51},
                                    {x: new Date(143334652600), y: 41},
                                    {x: new Date(143384652600), y: 31},
                                    {x: new Date(143568652600), y: 21},
                                ],
                            },
                        ],
                    },
                    chartOptions2: {
                        type: 'Line',
                        width: '33%',
                        height: '400px',
                        isScatter: true,
                        axisX: {
                            divisor: 5,
                            showGrid: true,
                            labelAlign: 'line',
                            tickFormat: function (value) {
                                let date

                                if (!value) {
                                    date = new Date()
                                }
                                else {
                                    date = new Date(value)
                                }

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
                            },
                        },
                        axisY: {
                            showGrid: true,
                        },
                        tooltip: {
                            xFormat: function (value) {
                                let date = new Date(parseInt(value))

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
                                    (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()
                            },
                        },
                    },
                },

                Pie: {
                    chartData: {
//                        categories: ['Jan', 'Feb', 'Mar'],//, 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        series: rslt.slice(0, 4).map(v => v[0])//[5, 4, 3]
                    },
                    chartOptions: {
                        type: 'Pie',
                        width: '33%',
                        height: '400px',
                        legend: {
                            show: true,
                        },
                    },
                },
            }
        },
        components: {
            chart,
        },

        methods: {
            legendPositionChange: function (position) {
                if (!this.Line.chartOptions2.legend) {
                    this.Line.chartOptions2.legend = {}
                }

                if (!this.Scatter.chartOptions2.legend) {
                    this.Scatter.chartOptions2.legend = {}
                }

                if (!this.Column.chartOptions.legend) {
                    this.Column.chartOptions.legend = {}
                }

                if (!this.StackBar.chartOptions.legend) {
                    this.StackBar.chartOptions.legend = {}
                }

                if (!this.Bar.chartOptions.legend) {
                    this.Bar.chartOptions.legend = {}
                }

                if (!this.Pie.chartOptions.legend) {
                    this.Pie.chartOptions.legend = {}
                }

                this.Line.chartOptions2.legend.position = position
                this.Scatter.chartOptions2.legend.position = position
                this.Column.chartOptions.legend.position = position
                this.StackBar.chartOptions.legend.position = position
                this.Bar.chartOptions.legend.position = position
                this.Pie.chartOptions.legend.position = position

                this.$refs.line.chart.updateChart(this.Line.chartData2, this.Line.chartOptions2)
                this.$refs.scatter.chart.updateChart(this.Scatter.chartData2, this.Scatter.chartOptions2)
                this.$refs.column.chart.updateChart(this.Column.chartData, this.Column.chartOptions)
                this.$refs.stackBar.chart.updateChart(this.StackBar.chartData, this.StackBar.chartOptions)
                this.$refs.bar.chart.updateChart(this.Bar.chartData, this.Bar.chartOptions)
                this.$refs.pie.chart.updateChart(this.Pie.chartData, this.Pie.chartOptions)
            },

            dataRecordChange: function (recordCnt, seriesCount) {
                let startTime = new Date(),
                    mockArray = ['n01', 'n02', 'n03', 'n04', 'n05', 'n06', 'n07', 'n08', 'n09', 'n10'],
                    series = mockArray.slice(0, seriesCount),
                    dataCnt, rslt;

                dataCnt = parseInt(recordCnt / series.length)
                rslt = series.map(row => new Array(dataCnt).fill(0).map((zero, x) => mock0[x][row]))
                this.Line.chartData.series = rslt.map(row => {
                    return {
                        data: row.map((col, i) => {
                            return {
                                x: new Date(143134652600 + 1000 * i),
                                y: col,
                            }
                        }),
                    }
                })

                let parseTime = new Date()
                this.parseTime = parseTime - startTime
//                this.Line.chartOptions.axisX.highLow.high = 143134652600 + 1000 * rslt[0].length
                this.$refs['stress-line'].chart.updateChart(this.Line.chartData, this.Line.chartOptions)

                let renderTime = new Date()
                this.renderTime = renderTime - parseTime
            },

            dataRecordChange2: function (recordCnt, seriesCount) {
                let startTime = new Date(),
                    mockArray = ['n01', 'n02', 'n03', 'n04', 'n05', 'n06', 'n07', 'n08', 'n09', 'n10'],
                    series = mockArray.slice(0, seriesCount),
                    dataCnt, rslt;

                dataCnt = parseInt(recordCnt / series.length)
                rslt = series.map(row => new Array(dataCnt).fill(0).map((zero, x) => mock0[x][row]))
                this.Scatter.chartData.series = rslt.map(row => {
                    return {
                        data: row.map((col, i) => {
                            return {
                                x: new Date(143134652600 + 1000 * i),
                                y: col,
                            }
                        }),
                    }
                })

                let parseTime = new Date();
                this.parseTime2 = parseTime - startTime;
//                this.Line.chartOptions.axisX.highLow.high = 143134652600 + 1000 * rslt[0].length;
                this.$refs['stress-scatter'].chart.updateChart(this.Scatter.chartData, this.Scatter.chartOptions);

                let renderTime = new Date();
                this.renderTime2 = renderTime - parseTime;
            },
        },
    }
</script>
<style>
</style>
