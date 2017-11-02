import Chart from '../chart.vue';
import CONST from '../common/const.vue';

import ColumnGroup from 'colgroup.vue';

export default {
    extends: Chart,
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
        scale() {
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

            return (this.height-CONST.TITLE_HEIGHT-CONST.MARGIN_Y*2) / (max - min);
        },

        geometry() {
            const
                rowGroupWidth = (this.width-CONST.MARGIN_X*2) / this.data.length,
                rowBlockWidth = rowGroupWidth - CONST.MARGIN_BETWEEN*2,
                rowBlockOffset = rowBlockWidth/this.columns.length;

            return {
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
        ColumnGroup
    }
 };