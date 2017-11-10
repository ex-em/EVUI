import Chart from '../chart.vue';
import CONST from '../common/const.js';

import RowGroup from './rowgroup.vue';
//import ColumnGroup from './colgroup.vue';

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
        return {};
    }, 
    computed: {
        rowGroupWidth() {
            return (this.width-CONST.MARGIN_X*2)/this.data.length;
        },
        rowBlockWidth() {
            return this.rowGroupWidth - CONST.MARGIN_BETWEEN*2;
        },
        rowBlockOffset() {
            return this.rowBlockWidth/this.columns.length;
        },
        cols() {
            return this.columns.map((c, i) => this.data.map(v => v[i]));
        }
    },
    methods: {
    },
    created: function() {
        window.test = this;
    },
    components: {
        RowGroup
        //ColumnGroup
    }
};