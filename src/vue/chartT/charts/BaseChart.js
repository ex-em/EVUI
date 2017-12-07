import Svg from '../common/Svg';
import Util from '../common/Util';
import Tooltip from '../common/Tooltip';


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

        this.container.style = `overflow:hidden; width: ${this.options.width}; height: ${this.options.height}; float:left;`;

        this.chartRect = this.getChartRect();

        this.createSvg(this.container);

        this.categories = data.categories || [];
        this.seriesStatus = [];

        for (let ix = 0, ixLen = data.series.length; ix < ixLen; ix++) {
            this.seriesStatus[ix] = true;
        }

        this.seriesInfo = this.getSeriesInfo(data.series);

        window.addEventListener('resize', function(){
            this.updateChart();
        }.bind(this));
    }

    createSvg(target) {
        this.svg = Svg.createElement(target, 'svg', {
            width: this.chartRect.chartWidth,
            height: this.chartRect.chartHeight,
            class: 'chart'
        });
    }

    onLegend(event) {
        let clickElement = event.target.parentElement,
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
            childElement, legendBox, legendName, legendValue, className, legendColor,
            ix, ixLen;

        parentElement.className = 'legend';

        if (position === 'bottom') {
            baseElement.appendChild(parentElement);
        }
        else if (position === 'top') {
            baseElement.insertBefore(parentElement, baseElement.childNodes[0]);
        }
        else if (position === 'right') {
            baseElement.appendChild(parentElement);
            parentElement.className += ' right';
        }

        for (ix = 0, ixLen = seriesNames.length; ix < ixLen; ix++) {
            childElement = document.createElement('li');
            legendBox = document.createElement('div');
            legendName = document.createElement('div');
            legendValue = document.createElement('div');

            childElement.setAttribute('data-index', ix);
            className = 'series-' + ix;

            if (!this.seriesStatus[ix]) {
                className += ' inactive';
            }

            childElement.className = className;
            legendBox.className = 'legend-box';
            legendName.className = 'legend-name';
            legendValue.className = 'legend-value';

            legendName.textContent = seriesNames[ix];
            // if (this.options.type === 'Pie') {
            //     legendValue.textContent = series[ix];
            // }

            legendColor = Util.getColor(ix);
            legendBox.style = `background-color: ${legendColor}; border: 2px solid ${legendColor};`;

            childElement.appendChild(legendBox);
            childElement.appendChild(legendName);
            childElement.appendChild(legendValue);

            parentElement.appendChild(childElement);
        }

        parentElement.style = `width: ${this.chartRect.legendWidth}px; height: ${this.chartRect.legendHeight}px;`;

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
            seriesNames.push(seriesName || 'series-' + ix);
        }

        return {
            seriesNames: seriesNames,
            series: series
        };
    }

    getChartRect() {
        let width = this.container.getBoundingClientRect().width || Util.quantity(this.options.width).value || 0,
            height = this.container.getBoundingClientRect().height || Util.quantity(this.options.height).value || 0,
            padding = this.getPadding(this.options.padding),
            hasAxis = !!(this.options.axisX || this.options.axisY),
            yAxisOffset = hasAxis ? this.options.axisY.offset : 0,
            xAxisOffset = hasAxis ? this.options.axisX.offset : 0,
            legendPos = this.options.legend.position,
            chartWidth, chartHeight, legendWidth, legendHeight, x1, x2, y1, y2;

        if (legendPos === 'right') {
            legendWidth = Util.quantity(this.options.legend.width).value || 150;
            legendHeight = Math.max(height, padding.top + padding.bottom);
            chartWidth = width - legendWidth - (padding.left + padding.right);
            chartHeight = legendHeight;
        }
        else {
            legendWidth = Math.max(width, padding.left + padding.right);
            legendHeight = (Util.quantity(this.options.legend.height).value || 40);
            chartWidth = legendWidth;
            chartHeight = height - legendHeight - (padding.top + padding.bottom);
        }

        if (hasAxis) {
            if (this.options.axisX.position === 'start') {
                y2 = padding.top + xAxisOffset;
                y1 = Math.max(chartHeight - padding.bottom, y2 + 1);
            }
            else {
                y2 = padding.top;
                y1 = Math.max(chartHeight - padding.bottom - xAxisOffset, y2 + 1);
            }

            if (this.options.axisY.position === 'start') {
                x1 = padding.left + yAxisOffset;
                x2 = Math.max(chartWidth - padding.right, x1 + 1);
            }
            else {
                x1 = padding.left;
                x2 = Math.max(chartWidth - padding.right - yAxisOffset, x1 + 1);
            }
        }
        else {
            x1 = padding.left;
            x2 = Math.max(chartWidth - padding.right, x1 + 1);
            y2 = padding.top;
            y1 = Math.max(chartHeight - padding.bottom, y2 + 1);
        }

        return {
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            padding: padding,
            chartWidth: chartWidth,
            chartHeight: chartHeight,
            legendWidth: legendWidth,
            legendHeight: legendHeight,
            width: function () {
                return this.x2 - this.x1;
            },
            height: function () {
                return this.y1 - this.y2;
            }
        };
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

        if (itemIndex !== 0 && !itemIndex) {
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
                Svg.removeClassName(svgElement, 'lowlight');
                if (this.options.type === 'Bar') {
                    if (itemIndex !== -1 && parseInt(svgElement.getAttribute('data-index')) !== itemIndex) {
                        Svg.addClassName(svgElement, 'lowlight');
                    }
                }
                else {
                    if (seriesIndex !== -1 && parseInt(seriesElement.getAttribute('data-index')) !== seriesIndex) {
                        Svg.addClassName(svgElement, 'lowlight');
                    }
                }
            }
        }
    }

    createTooltip($chart, options) {
        return Tooltip.getTooltip($chart, options);
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
