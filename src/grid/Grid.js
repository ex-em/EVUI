export default {
    props : {
        columns : Array,
        data: Array
    },
    data: function () {
        var sortOrders = {};
        this.columns.forEach(function (key) {
            sortOrders[key] = 1;
        });
        return {
            sortKey: '',
            sortOrders: sortOrders
        }
    },
    computed: {
        filteredData: function () {
            var sortKey = this.sortKey;
            var sortIndex = this.columns.indexOf(sortKey);
            var order = this.sortOrders[sortKey] || 1;
            var data = this.data;

            if (sortKey) {
                data = data.slice().sort(function (a, b) {
                    a = a[sortIndex];
                    b = b[sortIndex];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }

            return data;
        }
    },
    methods: {
        sortBy: function (key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
        }
    },
    created(){
        console.log(this);
    }
};
