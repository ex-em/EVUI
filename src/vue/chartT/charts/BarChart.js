import Svg from "../common/Svg"
import Util from "../common/Util"
import StepAxis from "../common/axis/StepAxis"
import AutoScaleAxis from "../common/axis/AutoScaleAxis"
import BaseChart from "./BaseChart"
import Core from '../common/Core'

class BarChart extends BaseChart {

    constructor(target, data, options) {
        let defaultOptions = {
                isStacked: false,
                isHorizontal: false
            };

        super(target, data, Util.extend(null, defaultOptions, options));
    }

    createChart() {
        this.createAxis();
        this.createSeries();

        if (this.options.legend.show) {
            this.createLegend(null);
        }

        this.tooltip = this.createTooltip(this.svg, this.options);
    }

    createAxis() {
        let labelGroup = Svg.createElement(this.svg, 'g'),
            gridGroup = Svg.createElement(this.svg, 'g'),
            series = this.seriesInfo.series.slice(0),
            axisX, axisY, ix, ixLen, bounds;

        for (ix = 0, ixLen = series.length; ix < ixLen; ix++) {
            if (!this.seriesStatus[ix]) {
                series.splice(ix, 1);
            }
        }

        if (this.options.isStacked) {
            bounds = this.getStackedBarBounds(series);
            this.options.axisY.high = bounds.max;
            this.options.axisY.low = bounds.min;
        }

        axisX = new StepAxis('x', this.categories, this.chartRect, this.options.axisX);
        axisY = new AutoScaleAxis('y', series, this.chartRect, this.options.axisY);

        axisX.createAxis(gridGroup, labelGroup);
        axisY.createAxis(gridGroup, labelGroup);

        this.axis = {
            axisX: axisX,
            axisY: axisY
        };
    }

    createSeries() {
        let series = this.seriesInfo.series,
            seriesNames = this.seriesInfo.seriesNames,
            seriesGroup = Svg.createElement(this.svg, 'g'),
            seriesListener = Svg.createElement(seriesGroup, 'rect', {
                width: this.options.width,
                height: this.options.height,
                style: 'opacity:0;',
            }),
            chartRect = this.chartRect,
            axisX = this.axis.axisX,
            axisY = this.axis.axisY,
            baseYPos = chartRect.y1 - axisY.getValue(0),
            stackedValues = [],
            seriesElement, lineElement, seriesData, positions, rowData, biPol, prevYPos,
            ix, ixLen, jx, jxLen, xPos, yPos;


        for (ix = 0, ixLen = series.length; ix < ixLen; ix++) {
            if (!this.seriesStatus[ix]) {
                continue;
            }

            seriesElement = Svg.createElement(seriesGroup, 'g', {
                class: seriesNames[ix]
            });

            seriesData = series[ix];
            biPol = ix - (ixLen - 1) / 2;

            for (jx = 0, jxLen = seriesData.length; jx < jxLen; jx++) {
                rowData = seriesData[jx];

                xPos = chartRect.x1 + axisX.getValue(seriesData[jx], jx, seriesData) + axisX.stepLength / 2;
                yPos = chartRect.y1 - axisY.getValue(seriesData[jx], jx, seriesData);

                prevYPos = stackedValues[jx] || baseYPos;
                stackedValues[jx] = prevYPos - (baseYPos - yPos);

                if (axisX.type === 'step') {
                    xPos += this.options.isStacked ? 0 : biPol * this.options.seriesBarDistance;
                }

                positions = {
                    x1: xPos,
                    x2: xPos,
                    y1: baseYPos,
                    y2: yPos,
                    class: 'ct-bar',
                    'ct:value': [rowData.x, rowData.y].filter(Core.isNumeric).join(','),
                    'ct:meta': seriesNames[ix],
                    'data-index': jx
                };

                if (this.options.isStacked) {
                    positions.y1 = prevYPos;
                    positions.y2 = stackedValues[jx];
                }

                lineElement = Svg.createElement(seriesElement, 'line', positions, null);
                lineElement.addEventListener('click', this.onHighlight.bind(this));
            }

            seriesListener.addEventListener('click', this.onHighlight.bind(this));
        }
    }

    getStackedBarBounds(data) {
        let max = 1,
            min = 0,
            ix, ixLen, jx, jxLen, value;

        if (!data || data.length === 0) {
            return {
                min: min,
                max: max
            }
        }

        for (ix = 0, ixLen = data[0].length; ix < ixLen; ix++) {
            value = 0;

            for (jx = 0, jxLen = data.length; jx < jxLen; jx++) {
                value += data[jx][ix].y;
            }

            if (max < value) {
                max = value;
            }
            else if (min > value) {
                min = value;
            }
        }

        return {
            min: min,
            max: max
        }
    }

}

export default BarChart;