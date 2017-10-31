import ColumnGroup from './colgroup.vue';

const
    MARGIN_X = 32,
    MARGIN_Y = 20,
    MARGIN_BETWEEN = 8,
    TITLE_HEIGHT = 64;

export default {
    props: {
        title: String,
        columns: Array,
        width: Number,
        height: Number,
        data: Array
    },
    data: function() {
        return {
            rowGroup: null
        };
    },
    computed: {
        range() {
            let min = Infinity, max = -Infinity,
                stackedMin = Infinity, stackedMax = -Infinity; // 얘를 어쩐다;;
            this.data.forEach(row => {
                row.forEach(v => {
                    min = Math.min(min, v);
                    max = Math.max(max, v);
                });

                const rowsum = row.reduce((p, v) => p + v, 0);

                stackedMax = Math.max(stackedMax, rowsum);
                stackedMin = Math.min(stackedMin, rowsum);
            });

            const
                scale = (this.height-TITLE_HEIGHT-MARGIN_Y*2) / (max - min),
                blockwidth = (this.width-MARGIN_X*2) / this.data.length,
                offset = (blockwidth - MARGIN_BETWEEN*2)/this.columns.length;

            return { max, min, scale, blockwidth, offset };
        },

        cols() {
            return this.columns.map((c, i) => this.data.map(v => v[i]));
        }
    },
    methods: {
        renderChart (chartData, options) {
            console.log("render data => ", chartData)
            console.log("render options =>", options)
        },
    },
    created: function() {
    },
    components: {
        ColumnGroup
    }
} ;