import Svg from "../common/Svg"
import Util from "../common/Util"
import BaseChart from "./BaseChart"
import Core from '../common/Core'

class PieChart extends BaseChart {

    constructor(target, data, options) {
        let defaultOptions = {
            startAngle: 0,
            showValue: true,
            valueFormat: function(n) { return n; }
        };

        super(target, data, Util.extend(null, defaultOptions, options));
    }

    createChart() {
        this.radius = Math.min(this.chartRect.width() / 2, this.chartRect.height() / 2);
        this.center = {
            x: this.chartRect.x1 + this.chartRect.width() / 2,
            y: this.chartRect.y2 + this.chartRect.height() / 2
        };

        this.createSeries();

        if (this.options.legend.show) {
            this.createLegend(null);
        }

        if (this.options.tooltip.show) {
            this.tooltip = this.createTooltip(this.svg, this.options);
        }
    }

    createSeries() {
        let series = this.seriesInfo.series,
            seriesName = this.seriesInfo.seriesNames,
            seriesGroup = Svg.createElement(this.svg, 'g'),
            totalValue = this.getTotalValue(series),
            startAngle = this.options.startAngle,
            center = this.center,
            radius = this.radius,
            valueRadius = radius / 2,
            seriesElement, pathInfo, pathElement, textElement,
            startPos, endPos, endAngle, position, value, color,
            ix, ixLen;

        for (ix = 0, ixLen = series.length; ix < ixLen; ix++) {
            if (!this.seriesStatus[ix]) {
                continue;
            }

            seriesElement = Svg.createElement(seriesGroup, 'g', {
                class: seriesName[ix]
            });

            color = Util.getColor(ix);
            endAngle = totalValue > 0 ? startAngle + series[ix] / totalValue * 360 : 0;
            if (endAngle === 360) {
                endAngle = 359.99;
            }

            startPos = Core.polarToCartesian(center.x, center.y, radius, startAngle);
            endPos = Core.polarToCartesian(center.x, center.y, radius, endAngle);

            pathInfo = [];
            pathInfo.push(Svg.moveElement(endPos.x, endPos.y));
            pathInfo.push(Svg.arcElement(radius, radius, 0, endAngle - startAngle > 180, 0, startPos.x, startPos.y));
            pathInfo.push(Svg.lineElement(center.x, center.y));

            pathElement = Svg.createElement(seriesElement, 'path', {
                d: Svg.stringify(pathInfo),
                class: 'slice-pie',
                style: 'fill: ' + color
            }, null);

            if (this.options.showValue) {
                value = this.options.valueFormat(series[ix]);
                if (totalValue === value) {
                    position = {
                        x: center.x,
                        y: center.y
                    }
                }
                else {
                    position = Core.polarToCartesian(center.x, center.y, valueRadius, startAngle + (endAngle - startAngle) / 2);
                }

                textElement = Svg.createElement(seriesElement, 'text', {
                    dx: position.x,
                    dy: position.y,
                    class: 'label pie-label',
                    'text-anchor': 'middle',
                    'ct:value': [seriesName[ix], value].join(','),
                    'ct:meta': seriesName[ix],
                }, null);

                textElement.appendChild(document.createTextNode(value));
            }

            startAngle = endAngle;
        }

    }

    getSeriesInfo(data) {
        let series = [],
            seriesNames = [],
            categories = this.categories,
            ix, ixLen;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            series.push(data[ix]);
            seriesNames.push(categories[ix] || 'series-' + ix);
        }

        return {
            seriesNames: seriesNames,
            series: series
        };
    }

    getTotalValue(data) {
        let total = 0,
            ix, ixLen;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            if (!this.seriesStatus[ix]) {
                continue;
            }

            total += data[ix];
        }

        return total;
    }

    updateChart(data = this.data, options = this.options) {
        let childNodes = this.container.childNodes,
            newSeriesStatus, ix, ixLen;

        for (ix = 0, ixLen = childNodes.length; ix < ixLen; ix++) {
            this.container.removeChild(this.container.firstChild);
        }

        this.options = Util.extend(null, this.options, options);

        this.chartRect = this.getChartRect();

        this.createSvg(this.container);

        this.categories = data.categories || [];

        newSeriesStatus = [];
        for (ix = 0, ixLen = data.series.length; ix < ixLen; ix++) {
            newSeriesStatus[ix] = this.seriesStatus[ix] === undefined ? true : this.seriesStatus[ix];
        }

        this.seriesStatus = newSeriesStatus;

        this.seriesInfo = this.getSeriesInfo(data.series);

        this.radius = Math.min(this.chartRect.width() / 2, this.chartRect.height() / 2);
        this.center = {
            x: this.chartRect.x1 + this.chartRect.width() / 2,
            y: this.chartRect.y2 + this.chartRect.height() / 2
        };

        this.createChart();
    }

}

export default PieChart;
