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

    export default {
        data() {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', './mock/chart/0.json', false);
            xhr.send(null);
            if(xhr.status==200) {
                let rslt = JSON.parse(xhr.responseText).map(v => {
                    return {
                        'Jan': v.n01,
                        'Feb': v.n02,
                        'Mar': v.n03,
                        'Apr': v.n04,
                        'May': v.n05,
                        'Jun': v.n06,
                        'Jul': v.n07,
                        'Aug': v.n08,
                        'Sep': v.n09,
                        'Oct': v.n10,
                        'Nov': v.n11,
                        'Dec': v.n12
                    };
                });

                return {
                    Bar: {
                        chartData: {
                            series: rslt
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
                    }
                }
            }
        },
        components: {
            chart
        }
    }
</script>