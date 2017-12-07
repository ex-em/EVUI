import BaseChart from './BaseChart';
import Svg from '../common/Svg';
import Intrpl from '../common/Interpolation';
import Core from '../common/Core';
import Util from '../common/Util';
import AutoScaleAxis from '../common/axis/AutoScaleAxis';
import FixedScaleAxis from '../common/axis/FixedScaleAxis';


class LineChart extends BaseChart {

    constructor(target, data, options) {
        let defaultOptions = {
            isScatter: false,
            lineWidth: 4,
            pointSize: 10,
        };

        super(target, data, Util.extend(null, defaultOptions, options));
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
            bounds, axisX, axisY, ix, ixLen;

        for (ix = 0, ixLen = series.length; ix < ixLen; ix++) {
            if (!this.seriesStatus[ix]) {
                series.splice(ix, 1);
            }
        }

        bounds = this.getBounds('x', series);
        this.options.axisX.high = bounds.max;
        this.options.axisX.low = bounds.min;

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
                width: this.chartRect.chartWidth,
                height: this.chartRect.chartHeight,
                class: 'series-listener'
            }),
            chartRect = this.chartRect,
            axisX = this.axis.axisX,
            axisY = this.axis.axisY,
            seriesNames = this.seriesInfo.seriesNames,
            isScatter = this.options.isScatter,
            lineWidth = Util.quantity(this.options.lineWidth).value,
            pointSize = Util.quantity(this.options.pointSize).value,
            seriesElement, seriesData, pathInfo, computedPathInfo, pathData, pathElement,
            pointElement, color,
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
            color = Util.getColor(ix);
            pathInfo = [];

            for (jx = 0, jxLen = seriesData.length; jx < jxLen; jx++) {
                pathInfo.push(chartRect.x1 + axisX.getValue(seriesData[jx], jx, seriesData));
                pathInfo.push(chartRect.y1 - axisY.getValue(seriesData[jx], jx, seriesData));
            }

            computedPathInfo = Intrpl.none(pathInfo);

            if (!isScatter) {
                pathElement = Svg.createElement(seriesElement, 'path', {
                    d: Svg.stringify(computedPathInfo),
                    class: 'line',
                    style: `stroke: ${color}; stroke-width: ${lineWidth}px;`
                }, null);
            }

            for (jx = 0, jxLen = computedPathInfo.length; jx < jxLen; jx++) {
                pathData = computedPathInfo[jx];
                pointElement = Svg.createElement(seriesElement, 'line', {
                    x1: pathData.x,
                    y1: pathData.y,
                    x2: pathData.x + 0.01,
                    y2: pathData.y,
                    class: 'point',
                    style: `stroke: ${color}; stroke-width: ${pointSize}px;`,
                    'ct:value': [seriesData[jx].x, seriesData[jx].y].filter(Core.isNumeric).join(','),
                    'ct:meta': seriesNames[ix]
                }, null);


                pointElement.addEventListener('click', this.onHighlight.bind(this));

            }

        }

        seriesListener.addEventListener('click', this.onHighlight.bind(this));
    }

    getBounds(pos, data) {
        let max, min, rowData,
            ix, ixLen, jx, jxLen, value;

        if (!data || data.length === 0) {
            return {
                min: 0,
                max: 1
            };
        }

        min = data[0][0][pos];
        max = min;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            rowData = data[ix];
            for (jx = 0, jxLen = rowData.length; jx < jxLen; jx++) {
                value = +rowData[jx][pos] || 0;
                if (max < value) {
                    max = value;
                }
                else if (min > value) {
                    min = value;
                }
            }
        }

        return {
            min: min || 0,
            max: max || 1
        };
    }


}

export default LineChart;
