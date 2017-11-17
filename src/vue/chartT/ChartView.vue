<template>
    <div>
        <chart :data="Line.chartData"
               :options="Line.chartOptions">
        </chart>
        <!--<chart :data="Scatter.chartData"-->
               <!--:options="Scatter.chartOptions">-->
        <!--</chart>-->
        <chart :data="Bar.chartData"
               :options="Bar.chartOptions">
        </chart>
        <!--<chart :data="StackedBar.chartData"-->
               <!--:options="StackedBar.chartOptions">-->
        <!--</chart>-->
        <chart :data="Pie.chartData"
               :options="Pie.chartOptions">
        </chart>
    </div>
</template>
<script>
    import chart from "./Chart.vue"

    export default {
        data() {
            return {
                Pie: {
                    chartData: {
//                        categories: ['Jan', 'Feb', 'Mar'],//, 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        series: [5, 4, 3]
                    },
                    chartOptions: {
                        type: "Pie",
//                        width: "800px",
                        height: "400px",
                        legend: {
                            show: true
                        }
                    }
                },
                StackedBar: {
                    chartData: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        series: [
                            [5, 4, 3, 7, 5, 10, 3, 4, 8, 10, 6, 8],
                            [3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4]
                        ]
                    },
                    chartOptions: {
                        type: "Bar",
//                        width: "800px",
                        height: "400px",
                        isHorizontalBar: false,
                        isStacked: true,
                        seriesBarDistance: 10,
                        axisX: {

                            showGrid: true,
                            labelAlign: 'between',
                        },
                        axisY: {
                            divisor: 5,
                            showGrid: true,
                        }
                    }
                },
                Bar: {
                    chartData: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        series: [
                            [5, 4, 3, 7, 5, 10, 3, 4, 8, 10, 6, 8],
                            [3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4]
                        ]
                    },
                    chartOptions: {
                        type: "Bar",
//                        width: "800px",
                        height: "400px",
                        isHorizontalBar: false,
                        seriesBarDistance: 10,
                        axisX: {
                            showGrid: true,
                            labelAlign: 'between',
                        },
                        axisY: {
                            divisor: 5,
                            showGrid: true,
                        }
                    }
                },
                Line: {
                    chartData: {
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
                                    {x: new Date(143579652600), y: 11}
                                ]
                            },
                            {
//                                name: 'series-2',
                                data: [
                                    {x: new Date(143134652600), y: 53},
                                    {x: new Date(143234652600), y: 35},
                                    {x: new Date(143334652600), y: 30},
                                    {x: new Date(143384652600), y: 30},
                                    {x: new Date(143568652600), y: 10}
                                ]
                            }
                        ]
                    },
                    chartOptions: {
                        type: "Line",
//                        width: "500px",
                        height: "400px",
                        axisX: {
                            divisor: 5,
                            showGrid: true,
                            labelAlign: 'line',
                            tickFormat: function(value) {
                                let date;

                                if (!value) {
                                    date = new Date();
                                }
                                else {
                                    date = new Date(value);
                                }

                                return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ":" +
                                       (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
                            }
                        },
                        axisY: {
                            showGrid: true,
                        },
                        tooltip: {
                            show: true,
                            xFormat: function(value){
                                let date = new Date(parseInt(value));

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" +
                                       (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()+ ":" +
                                       (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
                            }
                        }
                    }
                },
                Scatter: {
                    chartData: {
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
                                    {x: new Date(143568652600), y: 10}
                                ]
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
                                    {x: new Date(143568652600), y: 21}
                                ]
                            }
                        ]
                    },
                    chartOptions: {
                        type: "Line",
//                        width: "800px",
                        height: "400px",
                        isScatter: true,
                        axisX: {
                            divisor: 5,
                            showGrid: true,
                            labelAlign: 'line',
                            tickFormat: function(value) {
                                let date;

                                if (!value) {
                                    date = new Date();
                                }
                                else {
                                    date = new Date(value);
                                }

                                return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ":" +
                                       (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
                            }
                        },
                        axisY: {
                            showGrid: true,
                        },
                        tooltip: {
                            xFormat: function(value){
                                let date = new Date(parseInt(value));

                                return (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" +
                                    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()+ ":" +
                                    (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
                            }
                        }
                    }
                }
            }
        },
        components: {
            chart
        }
    }
</script>