<script>
    import CONST from './common/const.js';

    export default {
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

                return (this.height - CONST.TITLE_HEIGHT - CONST.MARGIN_Y*2) / (max - min) * 0.9;
            },
        }
    }
</script>