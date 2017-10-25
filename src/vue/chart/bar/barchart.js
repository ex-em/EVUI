import colgroup from 'colgroup.vue';

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
        };
    },
    computed: {
        range() {
            let min = Infinity, max = -Infinity;
            this.data.forEach(row => row.forEach(v => {
                min = Math.min(min, v);
                max = Math.max(max, v);
            }));

            return {
                max: max,
                min: min,
                scale: this.height / (max - min)
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
} ;