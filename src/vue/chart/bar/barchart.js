import rowgroup from 'rowgroup.vue';

const
    MARGIN_X = 32,
    MARGIN_Y = 20,
    MARGIN_BETWEEN = 8,
    TITLE_HEIGHT = 64,

export default {
    props: {
        title: String,
        columns: Array,
        width: Number,
        height: Number,
        data: Array,
        stacked: Boolean
    },
    data: function() {
        return {
        };
    },
    computed: {
        range() {
            let min = Infinity, max = -Infinity;
            this.data.forEach(row => {
                if(this.stacked) {
                    max = Math.max(max, row.filter(v => v>0).reduce((p, v) => p+v, 0));
                    min = Math.min(min, row.filter(v => v<0).reduce((p, v) => p+v, 0));
                } else row.forEach(v => {
                    min = Math.min(min, v);
                    max = Math.max(max, v);
                });
            });

            const
                scale = (this.height-TITLE_HEIGHT-MARGIN_Y*2) / (max - min),
                rowGroupWidth = (this.width-MARGIN_X*2) / this.data.length,
                rowBlockWidth = rowGroupWidth - MARGIN_BETWEEN*2,
                rowBlockOffset = blockwidth/this.columns.length;

            return {
                max,
                min,
                scale,
                rowGroupWidth,
                rowBlockWidth,
                rowBlockOffset
            };
        },

        cols() {
            return this.columns.map((c, i) => this.data.map(v => v[i]));
        }
    },
    methods: {
    },
    created: function() {
    },
    components: {
        colgroup
    }
};