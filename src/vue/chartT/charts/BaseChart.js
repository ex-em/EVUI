import Svg from "../common/Svg"
import Util from "../common/Util"
import Tooltip from "../common/Tooltip"

class BaseChart {
    constructor(target, data, options) {
        this.defaultOptions = {
            axisX: {
                offset: 30,
                showGrid: false,
                position: 'end',
                labelOffset: {
                    x: 0,
                    y: 0
                },
                tickFormat: function(n) { return n; }
            },
            axisY: {
                offset: 40,
                showGrid: false,
                position: 'start',
                scaleMinSpace: 20,
                labelOffset: {
                    x: 0,
                    y: 0
                },
                tickFormat: function(n) { return n; }
            },
            width: '100%',
            height: '100%',
            type: 'Line',
            tooltip: {
                show: true,
                xFormat: function(n) { return n; },
                yFormat: function(n) { return n; }
            },
            legend: {
                show: true,
                position: 'bottom'
            },
            padding: {
                top: 15,
                right: 50,
                bottom: 5,
                left: 10
            }
        };

        this.options = Util.extend(null, this.defaultOptions, options);
        this.container = target;
        this.data = data;

        this.createSvg(target);

        this.chartRect = this.getChartRect();
        this.categories = data.categories || [];
        this.seriesInfo = this.getSeriesInfo(data.series);
        this.seriesStatus = [];

        let ix, ixLen;
        for (ix = 0, ixLen = data.series.length; ix < ixLen; ix++) {
            this.seriesStatus[ix] = true;
        }
    }

    createSvg(target) {
        this.svg = Svg.createElement(target, 'svg', {
            width: this.options.width,
            height: this.options.height
        });
    }

    onLegend(event) {
        let clickElement = event.target,
            seriesIndex = parseInt(clickElement.getAttribute('data-index')),
            className = clickElement.className,
            isActive = !className.includes('inactive'),
            visibleCount = 0,
            ix, ixLen;

        for (ix = 0, ixLen = this.seriesStatus.length; ix < ixLen; ix++) {
            if (this.seriesStatus[ix]) {
                visibleCount++;
            }
        }

        if (visibleCount === 1 && isActive) {
            return ;
        }

        this.seriesStatus[seriesIndex] = !isActive;

        this.updateChart(this.data, this.options);
    }

    createLegend(clickFn) {
        let parentElement = document.createElement('ul'),
            seriesNames = this.seriesInfo.seriesNames,
            baseElement = this.container,
            position = this.options.legend.position,
            childElement,
            ix, ixLen;

        parentElement.className = 'ct-legend';

        if (position === 'bottom') {
            baseElement.appendChild(parentElement);
        }
        else if (position === 'top') {
            baseElement.insertBefore(parentElement, baseElement.childNodes[0]);
        }
        else if (position === 'right') {
            parentElement.className += ' ct-legend-inside';
        }

        for (ix = 0, ixLen = seriesNames.length; ix < ixLen; ix++) {
            childElement = document.createElement('li');

            childElement.setAttribute('data-index', ix);
            childElement.className = 'ct-series-' + ix;
            if (!this.seriesStatus[ix]) {
                childElement.className += ' inactive';
            }

            childElement.textContent = seriesNames[ix];

            parentElement.appendChild(childElement);
        }

        if (clickFn) {
            parentElement.addEventListener('click', clickFn);
        }
        else {
            parentElement.addEventListener('click', this.onLegend.bind(this));
        }
    }

    getSeriesInfo(data) {
        let series = [],
            seriesNames = [],
            seriesStatus = [],
            categories = this.categories,
            seriesData, tempRawData, tempSeriesData, tempData,
            ix, ixLen, jx, jxLen, value, seriesName;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            seriesData = data[ix];
            tempSeriesData = [];

            if (seriesData instanceof Array) {
                tempRawData = seriesData;
            }
            else {
                seriesName = seriesData.name;
                tempRawData = seriesData.data;
            }

            for (jx = 0, jxLen = tempRawData.length; jx < jxLen; jx++) {
                value = tempRawData[jx];
                tempData = {};

                if (value.hasOwnProperty('x') || value.hasOwnProperty('y')) {
                    tempData.x = value.hasOwnProperty('x') ? Util.getNumberValue(value.x) : null;
                    tempData.y = value.hasOwnProperty('y') ? Util.getNumberValue(value.y) : null;
                }
                else {
                    tempData.x = categories[jx];
                    tempData.y = value;
                }

                tempSeriesData.push(tempData);
            }

            series.push(tempSeriesData);
            seriesNames.push(seriesName || 'ct-series-' + ix);
        }

        return {
            seriesNames: seriesNames,
            series: series
        };
    }

    getChartRect() {
        let width = this.svg.getBoundingClientRect().width || Util.quantity(this.options.width).value || 0,
            height = this.svg.getBoundingClientRect().height || Util.quantity(this.options.height).value || 0,
            padding = this.getPadding(this.options.padding),
            hasAxis = !!(this.options.axisX || this.options.axisY),
            yAxisOffset = hasAxis ? this.options.axisY.offset : 0,
            xAxisOffset = hasAxis ? this.options.axisX.offset : 0,
            chartRect;

        width = Math.max(width, padding.left + padding.right);
        height = Math.max(height, padding.top + padding.bottom);

        chartRect = {
            padding: padding,
            width: function () {
                return this.x2 - this.x1;
            },
            height: function () {
                return this.y1 - this.y2;
            }
        };

        if (hasAxis) {
            if (this.options.axisX.position === 'start') {
                chartRect.y2 = padding.top + xAxisOffset;
                chartRect.y1 = Math.max(height - padding.bottom, chartRect.y2 + 1);
            }
            else {
                chartRect.y2 = padding.top;
                chartRect.y1 = Math.max(height - padding.bottom - xAxisOffset, chartRect.y2 + 1);
            }

            if (this.options.axisY.position === 'start') {
                chartRect.x1 = padding.left + yAxisOffset;
                chartRect.x2 = Math.max(width - padding.right, chartRect.x1 + 1);
            }
            else {
                chartRect.x1 = padding.left;
                chartRect.x2 = Math.max(width - padding.right - yAxisOffset, chartRect.x1 + 1);
            }
        }
        else {
            chartRect.x1 = padding.left;
            chartRect.x2 = Math.max(width - padding.right, chartRect.x1 + 1);
            chartRect.y2 = padding.top;
            chartRect.y1 = Math.max(height - padding.bottom, chartRect.y2 + 1);
        }

        return chartRect;
    }

    updateChart(data, options) {
        let childNodes = this.container.childNodes,
            ix, ixLen;

        for (ix = 0, ixLen = childNodes.length; ix < ixLen; ix++) {
            this.container.removeChild(this.container.firstChild);
        }

        this.options = Util.extend(null, this.options, options);

        this.createSvg(this.container);
        this.chartRect = this.getChartRect();
        this.categories = data.categories || [];
        this.seriesInfo = this.getSeriesInfo(data.series);

        this.createChart();
    }

    onHighlight(e) {
        let currElement = e.target,
            parentElement = currElement.parentElement,
            seriesGroup = currElement.tagName === 'rect' ? parentElement.childNodes : parentElement.parentElement.childNodes,
            seriesIndex = parseInt(parentElement.getAttribute('data-index')),
            itemIndex = parseInt(currElement.getAttribute('data-index')),
            seriesElement, svgElement, series,
            ix, ixLen, jx, jxLen;

        if (seriesIndex !== 0 && !seriesIndex) {
            seriesIndex = -1;
        }
        else if (itemIndex !== 0 && !itemIndex) {
            itemIndex = -1;
        }

        for (ix = 0, ixLen = seriesGroup.length; ix < ixLen; ix++) {
            seriesElement = seriesGroup[ix];
            if (seriesElement.tagName === 'rect') {
                continue;
            }

            series = seriesElement.childNodes;
            for (jx = 0, jxLen = series.length; jx < jxLen; jx++) {
                svgElement = series[jx];
                Svg.removeClassName(svgElement, 'ct-unchecked');
                if (this.options.type === 'Bar') {
                    if (itemIndex !== -1 && parseInt(svgElement.getAttribute('data-index')) !== itemIndex) {
                        Svg.addClassName(svgElement, 'ct-unchecked');
                    }
                }
                else {
                    if (seriesIndex !== -1 && parseInt(seriesElement.getAttribute('data-index')) !== seriesIndex) {
                        Svg.addClassName(svgElement, 'ct-unchecked');
                    }
                }
            }
        }
    }

    createTooltip($chart, options) {
        return Tooltip.getTooltip($chart, options)
    }

    getPadding(padding) {
        return typeof padding === 'number' ? {
            top: padding,
            right: padding,
            bottom: padding,
            left: padding
        } : {
            top: typeof padding.top === 'number' ? padding.top : fallback,
            right: typeof padding.right === 'number' ? padding.right : fallback,
            bottom: typeof padding.bottom === 'number' ? padding.bottom : fallback,
            left: typeof padding.left === 'number' ? padding.left : fallback
        };
    }

}

export default BaseChart;