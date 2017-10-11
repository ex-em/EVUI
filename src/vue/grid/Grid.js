export default {
    props : {
        gridInfo : Object,
        columns : Array,
        data: Array
    },
    data: function () {
        let sortOrders = {};
        this.columns.forEach(function (key) {
            sortOrders[key.cId] = 1;
        });
        return {
            gridStyle : null,
            titleStyle: null,
            sortKey: '',
            sortOrders: sortOrders
        }
    },
    computed: {
        gridOptions() {
            return Object.assign({
                title     : null,
                titleAlign: 'center',
                width     : '100%',
                height    : '100%'
            }, this.gridInfo);
        },
        
        sortedData: function () {
            let sortKey = this.sortKey;
            let sortIndex;

            for(let ix=0, ixLen=this.columns.length; ix<ixLen; ix++) {
                if(this.columns[ix].cId.indexOf(sortKey) > -1) {
                    sortIndex = ix;
                    break;
                }
            }

            let order = this.sortOrders[sortKey] || 1;
            let sortedData = this.data;

            if (sortKey) {
                sortedData = sortedData.slice().sort(function (a, b) {
                    a = a[sortIndex];
                    b = b[sortIndex];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }

            return sortedData;
        }
    },
    methods: {
        sortBy: function (key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
        }
    },
    created() {
        // set grid default style
        this.gridStyle = {
            'width' : typeof this.gridOptions.width === 'number' ? this.gridOptions.width + 'px' : this.gridOptions.width,
            'height': typeof this.gridOptions.height === 'number' ? this.gridOptions.height + 'px' : this.gridOptions.height
        };

        this.titleStyle = {
            'text-align' : this.gridOptions.titleAlign,
            'display'    : 'block'
        };
    }
};
