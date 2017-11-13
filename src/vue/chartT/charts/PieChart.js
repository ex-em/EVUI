import Svg from "../common/Svg"
import Util from "../common/Util"
import BaseChart from "./BaseChart"
import Core from '../common/Core'

class PieChart extends BaseChart {

    constructor(target, data, options) {
        let defaultOptions = {

        };

        super(target, data, Util.extend(null, defaultOptions, options));
    }

    createChart() {
        this.createAxis();
        this.createSeries();

        if (this.options.legend.show) {
            this.createLegend(null);
        }
    }

    createAxis() {

    }

    createSeries() {

    }

}

export default PieChart;