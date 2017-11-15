<template>
    <div >
        <!--div>
            <chart :data="Line.chartData"
                   :options="Line.chartOptions">
            </chart>
            <chart :data="Scatter.chartData"
                   :options="Scatter.chartOptions">
            </chart>
        </div-->
        <div>
            <chart :data="Bar.chartData"
                   :options="Bar.chartOptions">
            </chart>
            <!--hart :data="StackedBar.chartData"
                   :options="StackedBar.chartOptions">
            </chart-->
        </div>
    </div>
</template>
<script>
    import chart from "./Chart.vue"
    import mock0 from '../../mock/chart/0.json'

    export default {
        data() {
            let rslt = mock0.map(v => [v.n01, v.n02, v.n03, v.n04, v.n05, v.n06, v.n07, v.n08, v.n09, v.n10, v.n11, v.n12]);
            console.log(rslt.slice(0, 10));
            return {
                Bar: {
                    chartData: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        series: rslt.slice(0, 12)
                    },
                    chartOptions: {
                        type: "Bar",
//                        width: "800px",
                        height: "400px",
                        isHorizontalBar: true,
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
                }
            }
        },
        components: {
            chart
        }
    }
</script>