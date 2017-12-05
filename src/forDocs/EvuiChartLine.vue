<script>
    /**
     * 다양한 옵션과 설정으로 데이터를 Lien 차트형태로 보여줍니다.
     */
    export default {
        name:'evui-chart-Line',
        props:{
            /**
             * Scatter 형태로 보여줄지 설정합니다.
             */
            isScatter:{
                type: Boolean,
                default: false
            },

            /**
             * Line chart의 Line 굵기를 설정합니다.
             */
            lineWidth:{
                type: Number,
                default: 4
            },

            /**
             * Line chart의 point 크기를 설정합니다.
             */
            pointSize: {
                type: Number,
                default: 10
            }
        }
    }
</script>
