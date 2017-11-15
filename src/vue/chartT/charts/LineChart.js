import BaseChart from "./BaseChart"
import Svg from "../common/Svg"
import Intrpl from '../common/Interpolation'
import Core from '../common/Core'
import Tooltip from "../common/Tooltip"
import AutoScaleAxis from "../common/axis/AutoScaleAxis";
import FixedScaleAxis from "../common/axis/FixedScaleAxis";
import { color } from "../common/Constant"

class LineChart extends BaseChart {

    constructor(target, data, options) {
        let defaultOptions = {
            isScatter: false
        };

        super(target, data, options);
    }

    createChart() {
        this.createAxis();
        this.createSeries();

        if (this.options.legend.show) {
            this.createLegend(null);
        }

        if (this.options.tooltip.show) {
            this.tooltip = this.createTooltip(this.svg, this.options);
        }
    }

    createAxis() {
        let labelGroup = Svg.createElement(this.svg, 'g'),
            gridGroup = Svg.createElement(this.svg, 'g'),
            series = this.seriesInfo.series.slice(0),
            axisX, axisY, ix, ixLen;

        for (ix = 0, ixLen = series.length; ix < ixLen; ix++) {
            if (!this.seriesStatus[ix]) {
                series.splice(ix, 1);
            }
        }

        axisX = new FixedScaleAxis('x', series, this.chartRect, this.options.axisX);
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
            seriesGroup = Svg.createElement(this.svg, 'g'),
            seriesListener = Svg.createElement(seriesGroup, 'rect', {
                width: this.options.width,
                height: this.options.height,
                style: 'opacity:0;'
            }),
            chartRect = this.chartRect,
            axisX = this.axis.axisX,
            axisY = this.axis.axisY,
            seriesNames = this.seriesInfo.seriesNames,
            isScatter = this.options.isScatter,
            seriesElement, seriesData, pathInfo, computedPathInfo, pathData, pathElement,
            pointElement,
            ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = series.length; ix < ixLen; ix++) {
            if (!this.seriesStatus[ix]) {
                continue;
            }

            seriesElement = Svg.createElement(seriesGroup, 'g', {
                class: seriesNames[ix],
                'data-index': ix
            });

            seriesData = series[ix];
            pathInfo = [];

            for (jx = 0, jxLen = seriesData.length; jx < jxLen; jx++) {
                pathInfo.push(chartRect.x1 + axisX.getValue(seriesData[jx], jx, seriesData));
                pathInfo.push(chartRect.y1 - axisY.getValue(seriesData[jx], jx, seriesData));
            }

            computedPathInfo = Intrpl.none(pathInfo);

            if (!isScatter) {
                pathElement = Svg.createElement(seriesElement, 'path', {
                    d: Svg.stringify(computedPathInfo),
                    class: 'ct-line',
                    style: 'stroke: ' + color[ix]
                }, null);
            }

            for (jx = 0, jxLen = computedPathInfo.length; jx < jxLen; jx++) {
                pathData = computedPathInfo[jx];
                pointElement = Svg.createElement(seriesElement, 'line', {
                    x1: pathData.x,
                    y1: pathData.y,
                    x2: pathData.x + 0.01,
                    y2: pathData.y,
                    class: 'ct-point',
                    style: 'stroke: ' + color[ix],
                    'ct:value': [seriesData[jx].x, seriesData[jx].y].filter(Core.isNumeric).join(','),
                    'ct:meta': seriesNames[ix]
                }, null);

                if (!isScatter) {
                    pointElement.addEventListener('click', this.onHighlight.bind(this));
                }
            }

        }

        if (!isScatter) {
            seriesListener.addEventListener('click', this.onHighlight.bind(this));
        }
    }


}

export default LineChart;