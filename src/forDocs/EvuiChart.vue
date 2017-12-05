<script>
    /**
     * 다양한 옵션과 설정으로 데이터를 차트형태로 보여줍니다.(default : Line)
     */
    export default {
        name:'evui-chart',
        props:{
            /**
             *  <div>
             *  X축을 설정합니다.
             *  <br>
             *  default: {
             *  <br> &nbsp;&nbsp;offset: 30,
             *  <br> &nbsp;&nbsp;showGrid: false,
             *  <br> &nbsp;&nbsp;position:'end'
             *  <br> &nbsp;&nbsp;labelOffset:{ x:0, y:0 }
             *  <br> &nbsp;&nbsp;tickFormat: function(n) { return n; }
             *  <br>
             *  }
             *  </div>
             */
            axisX:{
                type: Object,
                default: {
                    offset: 30,
                    showGrid: false,
                    position: 'end',
                    labelOffset: {
                        x: 0,
                        y: 0
                    },
                    tickFormat: function(n) { return n; }
                }
            },

            /**
             *  <div>
             *  Y축을 설정합니다.
             *  <br>
             *  default: {
             *  <br> &nbsp;&nbsp;offset: 40,
             *  <br> &nbsp;&nbsp;showGrid: false,
             *  <br> &nbsp;&nbsp;position:'start'
             *  <br> &nbsp;&nbsp;labelOffset:{ x:0, y:0 }
             *  <br> &nbsp;&nbsp;tickFormat: function(n) { return n; }
             *  <br>
             *  }
             *  </div>
             */
            axisY:{
                offset: 40,
                showGrid: false,
                position: 'start',
                scaleMinSpace: 20,
                labelOffset: {
                    x: 0,
                    y: 0
                },
                tickFormat: function(n) { return n; }
            },

            /**
             * 차트의 width를 설정합니다.
             */
            width: {
                type:String,
                default : '100%'
            },

            /**
             * 차트의 height를 설정합니다.
             */
            height:{
                type:String,
                default: '100%'
            },

            /**
             * 차트의 타입을 설정합니다. `Line | Bar | Pie`
             */
            type:{
                type:String,
                default:'Line'
            },

            /**
             * <div>
             * 차트의 툴팁을 설정 합니다.
             *  <br>
             *  default: {
             *  <br> &nbsp;&nbsp;show: false,
             *  <br> &nbsp;&nbsp;xFormat: function(n) { return n; },
             *  <br> &nbsp;&nbsp;yFormat:'function(n) { return n; }
             *  <br>}
             *  </div>
             */
            tooltip:{
                type: Object,
                default:{
                    show: true,
                    xFormat: function(n) { return n; },
                    yFormat: function(n) { return n; }
                }
            },

            /**
             * <div>
             * 차트의 범례를 설정 합니다.
             *  <br>
             *  default: {
             *  <br> &nbsp;&nbsp;show: false,
             *  <br> &nbsp;&nbsp;position: 'bottom'     &nbsp;&nbsp;&nbsp;&nbsp;//`Bottom | Top | Left| Right`
             *  <br>}
             *  </div>
             */
            legend :{
                type:Object,
                default:{
                    show: true,
                    position: 'bottom'
                }
            },

            /**
             * <div>
             * 차트의 패딩을 설정 합니다.
             *  <br>
             *  default: {
             *  <br> &nbsp;&nbsp;top: 15,
             *  <br> &nbsp;&nbsp;right: 50,
             *  <br> &nbsp;&nbsp;bottom: 5,
             *  <br> &nbsp;&nbsp;right: 10
             *  <br>}
             *  </div>
             */
            padding:{
                type:Object,
                default:{
                    top: 15,
                    right: 50,
                    bottom: 5,
                    left: 10
                }
            }
        }
    }
</script>
