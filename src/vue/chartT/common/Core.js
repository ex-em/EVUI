export default {

    namespaces: {
        svg: 'http://www.w3.org/2000/svg',
        xmlns: 'http://www.w3.org/2000/xmlns/',
        xhtml: 'http://www.w3.org/1999/xhtml',
        xlink: 'http://www.w3.org/1999/xlink',
        ct: 'http://gionkunz.github.com/chartist-js/ct'
    },

    noop: function (n) {
        return n;
    },

    alphaNumerate: function (n) {
        // Limit to a-z
        return String.fromCharCode(97 + n % 26);
    },

    extend: function (target) {
        var i, source, sourceProp;
        target = target || {};

        for (i = 1; i < arguments.length; i++) {
            source = arguments[i];
            for (var prop in source) {
                sourceProp = source[prop];
                if (typeof sourceProp === 'object' && sourceProp !== null && !(sourceProp instanceof Array)) {
                    target[prop] = this.extend(target[prop], sourceProp);
                } else {
                    target[prop] = sourceProp;
                }
            }
        }

        return target;
    },

    replaceAll: function(str, subStr, newSubStr) {
        return str.replace(new RegExp(subStr, 'g'), newSubStr);
    },

    ensureUnit: function(value, unit) {
        if(typeof value === 'number') {
            value = value + unit;
        }

        return value;
    },

    quantity: function(input) {
        if (typeof input === 'string') {
            var match = (/^(\d+)\s*(.*)$/g).exec(input);
            return {
                value : +match[1],
                unit: match[2] || undefined
            };
        }
        return { value: input };
    },

    querySelector: function(query) {
        return query instanceof Node ? query : document.querySelector(query);
    },

    times: function(length) {
        return Array.apply(null, new Array(length));
    },

    sum: function(previous, current) {
        return previous + (current ? current : 0);
    },

    mapMultiply: function(factor) {
        return function(num) {
            return num * factor;
        };
    },

    mapAdd: function(addend) {
        return function(num) {
            return num + addend;
        };
    },

    serialMap: function(arr, cb) {
        var result = [],
            length = Math.max.apply(null, arr.map(function(e) {
                return e.length;
            }));

        this.times(length).forEach(function(e, index) {
            var args = arr.map(function(e) {
                return e[index];
            });

            result[index] = cb.apply(null, args);
        });

        return result;
    },

    roundWithPrecision: function(value, digits) {
        var precision = Math.pow(10, digits || this.precision);
        return Math.round(value * precision) / precision;
    },

    precision: 8,

    escapingMap: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#039;'
    },

    serialize: function(data) {
        if(data === null || data === undefined) {
            return data;
        } else if(typeof data === 'number') {
            data = ''+data;
        } else if(typeof data === 'object') {
            data = JSON.stringify({data: data});
        }

        return Object.keys(this.escapingMap).reduce(function(result, key) {
            return this.replaceAll(result, key, this.escapingMap[key]);
        }, data);
    },

    deserialize: function(data) {
        if(typeof data !== 'string') {
            return data;
        }

        data = Object.keys(this.escapingMap).reduce(function(result, key) {
            return this.replaceAll(result, this.escapingMap[key], key);
        }, data);

        try {
            data = JSON.parse(data);
            data = data.data !== undefined ? data.data : data;
        } catch(e) {}

        return data;
    },

    createSvg: function (container, width, height, className) {
        var svg;

        width = width || '100%';
        height = height || '100%';

        // Check if there is a previous SVG element in the container that contains the Chartist XML namespace and remove it
        // Since the DOM API does not support namespaces we need to manually search the returned list http://www.w3.org/TR/selectors-api/
        Array.prototype.slice.call(container.querySelectorAll('svg')).filter(function filterChartistSvgObjects(svg) {
            return svg.getAttributeNS(this.namespaces.xmlns, 'ct');
        }).forEach(function removePreviousElement(svg) {
            container.removeChild(svg);
        });

        // Create svg object with width and height or use 100% as default
        svg = new Chartist.Svg('svg').attr({
            width: width,
            height: height
        }).addClass(className);

        svg._node.style.width = width;
        svg._node.style.height = height;

        // Add the DOM node to our container
        container.appendChild(svg._node);

        return svg;
    },

    normalizeData: function(data, reverse, multi) {
        var labelCount;
        var output = {
            raw: data,
            normalized: {}
        };

        // Check if we should generate some labels based on existing series data
        output.normalized.series = this.getDataArray({
            series: data.series || []
        }, reverse, multi);

        // If all elements of the normalized data array are arrays we're dealing with
        // multi series data and we need to find the largest series if they are un-even
        if (output.normalized.series.every(function(value) {
                return value instanceof Array;
            })) {
            // Getting the series with the the most elements
            labelCount = Math.max.apply(null, output.normalized.series.map(function(series) {
                return series.length;
            }));
        } else {
            // We're dealing with Pie data so we just take the normalized array length
            labelCount = output.normalized.series.length;
        }

        output.normalized.labels = (data.labels || []).slice();
        // Padding the labels to labelCount with empty strings
        Array.prototype.push.apply(
            output.normalized.labels,
            this.times(Math.max(0, labelCount - output.normalized.labels.length)).map(function() {
                return '';
            })
        );

        if(reverse) {
            this.reverseData(output.normalized);
        }

        return output;
    },

    safeHasProperty: function(object, property) {
        return object !== null &&
            typeof object === 'object' &&
            object.hasOwnProperty(property);
    },

    isDataHoleValue: function(value) {
        return value === null ||
            value === undefined ||
            (typeof value === 'number' && isNaN(value));
    },

    reverseData: function(data) {
        data.labels.reverse();
        data.series.reverse();
        for (var i = 0; i < data.series.length; i++) {
            if(typeof(data.series[i]) === 'object' && data.series[i].data !== undefined) {
                data.series[i].data.reverse();
            } else if(data.series[i] instanceof Array) {
                data.series[i].reverse();
            }
        }
    },

    getDataArray: function(data, reverse, multi) {
        let self = this;
        // Recursively walks through nested arrays and convert string values to numbers and objects with value properties
        // to values. Check the tests in data core -> data normalization for a detailed specification of expected values
        function recursiveConvert(value) {
            if(self.safeHasProperty(value, 'value')) {
                // We are dealing with value object notation so we need to recurse on value property
                return recursiveConvert(value.value);
            } else if(self.safeHasProperty(value, 'data')) {
                // We are dealing with series object notation so we need to recurse on data property
                return recursiveConvert(value.data);
            } else if(value instanceof Array) {
                // Data is of type array so we need to recurse on the series
                return value.map(recursiveConvert);
            } else if(self.isDataHoleValue(value)) {
                // We're dealing with a hole in the data and therefore need to return undefined
                // We're also returning undefined for multi value output
                return undefined;
            } else {
                // We need to prepare multi value output (x and y data)
                if(multi) {
                    var multiValue = {};

                    // Single series value arrays are assumed to specify the Y-Axis value
                    // For example: [1, 2] => [{x: undefined, y: 1}, {x: undefined, y: 2}]
                    // If multi is a string then it's assumed that it specified which dimension should be filled as default
                    if(typeof multi === 'string') {
                        multiValue[multi] = self.getNumberOrUndefined(value);
                    } else {
                        multiValue.y = self.getNumberOrUndefined(value);
                    }

                    multiValue.x = value.hasOwnProperty('x') ? self.getNumberOrUndefined(value.x) : multiValue.x;
                    multiValue.y = value.hasOwnProperty('y') ? self.getNumberOrUndefined(value.y) : multiValue.y;

                    return multiValue;

                } else {
                    // We can return simple data
                    return self.getNumberOrUndefined(value);
                }
            }
        }

        return data.series.map(recursiveConvert);
    },

    normalizePadding: function(padding, fallback) {
        fallback = fallback || 0;

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
    },

    getMetaData: function(series, index) {
        var value = series.data ? series.data[index] : series[index];
        return value ? value.meta : undefined;
    },

    orderOfMagnitude: function (value) {
        return Math.floor(Math.log(Math.abs(value)) / Math.LN10);
    },

    projectLength: function (axisLength, length, bounds) {
        return length / bounds.range * axisLength;
    },

    getAvailableHeight: function (svg, options) {
        return Math.max((this.quantity(options.height).value || svg.height()) - (options.chartPadding.top +  options.chartPadding.bottom) - options.axisX.offset, 0);
    },

    getHighLow: function (data, options, dimension) {
        // TODO: Remove workaround for deprecated global high / low config. Axis high / low configuration is preferred
        options = this.extend({}, options, dimension ? options['axis' + dimension.toUpperCase()] : {});

        var highLow = {
            high: options.high === undefined ? -Number.MAX_VALUE : +options.high,
            low: options.low === undefined ? Number.MAX_VALUE : +options.low
        };
        var findHigh = options.high === undefined;
        var findLow = options.low === undefined;

        // Function to recursively walk through arrays and find highest and lowest number
        function recursiveHighLow(data) {
            if(data === undefined) {
                return undefined;
            } else if(data instanceof Array) {
                for (var i = 0; i < data.length; i++) {
                    recursiveHighLow(data[i]);
                }
            } else {
                var value = dimension ? +data[dimension] : +data;

                if (findHigh && value > highLow.high) {
                    highLow.high = value;
                }

                if (findLow && value < highLow.low) {
                    highLow.low = value;
                }
            }
        }

        // Start to find highest and lowest number recursively
        if(findHigh || findLow) {
            recursiveHighLow(data);
        }

        // Overrides of high / low based on reference value, it will make sure that the invisible reference value is
        // used to generate the chart. This is useful when the chart always needs to contain the position of the
        // invisible reference value in the view i.e. for bipolar scales.
        if (options.referenceValue || options.referenceValue === 0) {
            highLow.high = Math.max(options.referenceValue, highLow.high);
            highLow.low = Math.min(options.referenceValue, highLow.low);
        }

        // If high and low are the same because of misconfiguration or flat data (only the same value) we need
        // to set the high or low to 0 depending on the polarity
        if (highLow.high <= highLow.low) {
            // If both values are 0 we set high to 1
            if (highLow.low === 0) {
                highLow.high = 1;
            } else if (highLow.low < 0) {
                // If we have the same negative value for the bounds we set bounds.high to 0
                highLow.high = 0;
            } else if (highLow.high > 0) {
                // If we have the same positive value for the bounds we set bounds.low to 0
                highLow.low = 0;
            } else {
                // If data array was empty, values are Number.MAX_VALUE and -Number.MAX_VALUE. Set bounds to prevent errors
                highLow.high = 1;
                highLow.low = 0;
            }
        }

        return highLow;
    },

    isNumeric: function(value) {
        return value === null ? false : isFinite(value);
    },

    isFalseyButZero: function(value) {
        return !value && value !== 0;
    },

    getNumberOrUndefined: function(value) {
        return this.isNumeric(value) ? +value : undefined;
    },

    isMultiValue: function(value) {
        return typeof value === 'object' && ('x' in value || 'y' in value);
    },

    getMultiValue: function(value, dimension) {
        if(this.isMultiValue(value)) {
            return this.getNumberOrUndefined(value[dimension || 'y']);
        } else {
            return this.getNumberOrUndefined(value);
        }
    },

    rho: function(num) {
        if(num === 1) {
            return num;
        }

        function gcd(p, q) {
            if (p % q === 0) {
                return q;
            } else {
                return gcd(q, p % q);
            }
        }

        function f(x) {
            return x * x + 1;
        }

        var x1 = 2, x2 = 2, divisor;
        if (num % 2 === 0) {
            return 2;
        }

        do {
            x1 = f(x1) % num;
            x2 = f(f(x2)) % num;
            divisor = gcd(Math.abs(x1 - x2), num);
        } while (divisor === 1);

        return divisor;
    },

    getBounds: function (axisLength, highLow, scaleMinSpace, onlyInteger) {
        var i,
            optimizationCounter = 0,
            newMin,
            newMax,
            bounds = {
                high: highLow.high,
                low: highLow.low
            };

        bounds.valueRange = bounds.high - bounds.low;
        bounds.oom = this.orderOfMagnitude(bounds.valueRange);
        bounds.step = Math.pow(10, bounds.oom);
        bounds.min = Math.floor(bounds.low / bounds.step) * bounds.step;
        bounds.max = Math.ceil(bounds.high / bounds.step) * bounds.step;
        bounds.range = bounds.max - bounds.min;
        bounds.numberOfSteps = Math.round(bounds.range / bounds.step);

        // Optimize scale step by checking if subdivision is possible based on horizontalGridMinSpace
        // If we are already below the scaleMinSpace value we will scale up
        var length = this.projectLength(axisLength, bounds.step, bounds);
        var scaleUp = length < scaleMinSpace;
        var smallestFactor = onlyInteger ? Chartist.rho(bounds.range) : 0;

        // First check if we should only use integer steps and if step 1 is still larger than scaleMinSpace so we can use 1
        if(onlyInteger && this.projectLength(axisLength, 1, bounds) >= scaleMinSpace) {
            bounds.step = 1;
        } else if(onlyInteger && smallestFactor < bounds.step && this.projectLength(axisLength, smallestFactor, bounds) >= scaleMinSpace) {
            // If step 1 was too small, we can try the smallest factor of range
            // If the smallest factor is smaller than the current bounds.step and the projected length of smallest factor
            // is larger than the scaleMinSpace we should go for it.
            bounds.step = smallestFactor;
        } else {
            // Trying to divide or multiply by 2 and find the best step value
            while (true) {
                if (scaleUp && this.projectLength(axisLength, bounds.step, bounds) <= scaleMinSpace) {
                    bounds.step *= 2;
                } else if (!scaleUp && this.projectLength(axisLength, bounds.step / 2, bounds) >= scaleMinSpace) {
                    bounds.step /= 2;
                    if(onlyInteger && bounds.step % 1 !== 0) {
                        bounds.step *= 2;
                        break;
                    }
                } else {
                    break;
                }

                if(optimizationCounter++ > 1000) {
                    throw new Error('Exceeded maximum number of iterations while optimizing scale step!');
                }
            }
        }

        var EPSILON = 2.221E-16;
        bounds.step = Math.max(bounds.step, EPSILON);
        function safeIncrement(value, increment) {
            // If increment is too small use *= (1+EPSILON) as a simple nextafter
            if (value === (value += increment)) {
                value *= (1 + (increment > 0 ? EPSILON : -EPSILON));
            }
            return value;
        }

        // Narrow min and max based on new step
        newMin = bounds.min;
        newMax = bounds.max;
        while (newMin + bounds.step <= bounds.low) {
            newMin = safeIncrement(newMin, bounds.step);
        }
        while (newMax - bounds.step >= bounds.high) {
            newMax = safeIncrement(newMax, -bounds.step);
        }
        bounds.min = newMin;
        bounds.max = newMax;
        bounds.range = bounds.max - bounds.min;

        var values = [];
        for (i = bounds.min; i <= bounds.max; i = safeIncrement(i, bounds.step)) {
            var value = this.roundWithPrecision(i);
            if (value !== values[values.length - 1]) {
                values.push(value);
            }
        }
        bounds.values = values;
        return bounds;
    },

    polarToCartesian: function (centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    },

    createChartRect: function (svg, options, fallbackPadding) {
        var hasAxis = !!(options.axisX || options.axisY);
        var yAxisOffset = hasAxis ? options.axisY.offset : 0;
        var xAxisOffset = hasAxis ? options.axisX.offset : 0;
        // If width or height results in invalid value (including 0) we fallback to the unitless settings or even 0
        var width = svg.width() || this.quantity(options.width).value || 0;
        var height = svg.height() || this.quantity(options.height).value || 0;
        var normalizedPadding = this.normalizePadding(options.chartPadding, fallbackPadding);

        // If settings were to small to cope with offset (legacy) and padding, we'll adjust
        width = Math.max(width, yAxisOffset + normalizedPadding.left + normalizedPadding.right);
        height = Math.max(height, xAxisOffset + normalizedPadding.top + normalizedPadding.bottom);

        var chartRect = {
            padding: normalizedPadding,
            width: function () {
                return this.x2 - this.x1;
            },
            height: function () {
                return this.y1 - this.y2;
            }
        };

        if(hasAxis) {
            if (options.axisX.position === 'start') {
                chartRect.y2 = normalizedPadding.top + xAxisOffset;
                chartRect.y1 = Math.max(height - normalizedPadding.bottom, chartRect.y2 + 1);
            } else {
                chartRect.y2 = normalizedPadding.top;
                chartRect.y1 = Math.max(height - normalizedPadding.bottom - xAxisOffset, chartRect.y2 + 1);
            }

            if (options.axisY.position === 'start') {
                chartRect.x1 = normalizedPadding.left + yAxisOffset;
                chartRect.x2 = Math.max(width - normalizedPadding.right, chartRect.x1 + 1);
            } else {
                chartRect.x1 = normalizedPadding.left;
                chartRect.x2 = Math.max(width - normalizedPadding.right - yAxisOffset, chartRect.x1 + 1);
            }
        } else {
            chartRect.x1 = normalizedPadding.left;
            chartRect.x2 = Math.max(width - normalizedPadding.right, chartRect.x1 + 1);
            chartRect.y2 = normalizedPadding.top;
            chartRect.y1 = Math.max(height - normalizedPadding.bottom, chartRect.y2 + 1);
        }

        return chartRect;
    },

    createGrid: function(position, index, axis, offset, length, group, classes, eventEmitter) {
        var positionalData = {};
        positionalData[axis.units.pos + '1'] = position;
        positionalData[axis.units.pos + '2'] = position;
        positionalData[axis.counterUnits.pos + '1'] = offset;
        positionalData[axis.counterUnits.pos + '2'] = offset + length;

        var gridElement = group.elem('line', positionalData, classes.join(' '));

        // Event for grid draw
        eventEmitter.emit('draw',
            this.extend({
                type: 'grid',
                axis: axis,
                index: index,
                group: group,
                element: gridElement
            }, positionalData)
        );
    },

    createGridBackground: function (gridGroup, chartRect, className, eventEmitter) {
        var gridBackground = gridGroup.elem('rect', {
            x: chartRect.x1,
            y: chartRect.y2,
            width: chartRect.width(),
            height: chartRect.height(),
        }, className, true);

        // Event for grid background draw
        eventEmitter.emit('draw', {
            type: 'gridBackground',
            group: gridGroup,
            element: gridBackground
        });
    },

    createLabel: function(position, length, index, labels, axis, axisOffset, labelOffset, group, classes, useForeignObject, eventEmitter) {
        var labelElement;
        var positionalData = {};

        positionalData[axis.units.pos] = position + labelOffset[axis.units.pos];
        positionalData[axis.counterUnits.pos] = labelOffset[axis.counterUnits.pos];
        positionalData[axis.units.len] = length;
        positionalData[axis.counterUnits.len] = Math.max(0, axisOffset - 10);

        if(useForeignObject) {
            // We need to set width and height explicitly to px as span will not expand with width and height being
            // 100% in all browsers
            var content = document.createElement('span');
            content.className = classes.join(' ');
            content.setAttribute('xmlns', this.namespaces.xhtml);
            content.innerText = labels[index];
            content.style[axis.units.len] = Math.round(positionalData[axis.units.len]) + 'px';
            content.style[axis.counterUnits.len] = Math.round(positionalData[axis.counterUnits.len]) + 'px';

            labelElement = group.foreignObject(content, this.extend({
                style: 'overflow: visible;'
            }, positionalData));
        } else {
            labelElement = group.elem('text', positionalData, classes.join(' ')).text(labels[index]);
        }

        eventEmitter.emit('draw', this.extend({
            type: 'label',
            axis: axis,
            index: index,
            group: group,
            element: labelElement,
            text: labels[index]
        }, positionalData));
    },

    getSeriesOption: function(series, options, key) {
        if(series.name && options.series && options.series[series.name]) {
            var seriesOptions = options.series[series.name];
            return seriesOptions.hasOwnProperty(key) ? seriesOptions[key] : options[key];
        } else {
            return options[key];
        }
    },

    optionsProvider: function (options, responsiveOptions, eventEmitter) {
        var baseOptions = this.extend({}, options),
            currentOptions,
            mediaQueryListeners = [],
            i, self = this;

        function updateCurrentOptions(mediaEvent) {
            var previousOptions = currentOptions;
            currentOptions = self.extend({}, baseOptions);

            if (responsiveOptions) {
                for (i = 0; i < responsiveOptions.length; i++) {
                    var mql = window.matchMedia(responsiveOptions[i][0]);
                    if (mql.matches) {
                        currentOptions = self.extend(currentOptions, responsiveOptions[i][1]);
                    }
                }
            }

            if(eventEmitter && mediaEvent) {
                eventEmitter.emit('optionsChanged', {
                    previousOptions: previousOptions,
                    currentOptions: currentOptions
                });
            }
        }

        function removeMediaQueryListeners() {
            mediaQueryListeners.forEach(function(mql) {
                mql.removeListener(updateCurrentOptions);
            });
        }

        if (!window.matchMedia) {
            throw 'window.matchMedia not found! Make sure you\'re using a polyfill.';
        } else if (responsiveOptions) {

            for (i = 0; i < responsiveOptions.length; i++) {
                var mql = window.matchMedia(responsiveOptions[i][0]);
                mql.addListener(updateCurrentOptions);
                mediaQueryListeners.push(mql);
            }
        }
        // Execute initially without an event argument so we get the correct options
        updateCurrentOptions();

        return {
            removeMediaQueryListeners: removeMediaQueryListeners,
            getCurrentOptions: function getCurrentOptions() {
                return self.extend({}, currentOptions);
            }
        };
    },

    splitIntoSegments: function(pathCoordinates, valueData, options) {
        var defaultOptions = {
            increasingX: false,
            fillHoles: false
        };

        options = this.extend({}, defaultOptions, options);

        var segments = [];
        var hole = true;

        for(var i = 0; i < pathCoordinates.length; i += 2) {
            // If this value is a "hole" we set the hole flag
            if(this.getMultiValue(valueData[i / 2].value) === undefined) {
                // if(valueData[i / 2].value === undefined) {
                if(!options.fillHoles) {
                    hole = true;
                }
            } else {
                if(options.increasingX && i >= 2 && pathCoordinates[i] <= pathCoordinates[i-2]) {
                    // X is not increasing, so we need to make sure we start a new segment
                    hole = true;
                }


                // If it's a valid value we need to check if we're coming out of a hole and create a new empty segment
                if(hole) {
                    segments.push({
                        pathCoordinates: [],
                        valueData: []
                    });
                    // As we have a valid value now, we are not in a "hole" anymore
                    hole = false;
                }

                // Add to the segment pathCoordinates and valueData
                segments[segments.length - 1].pathCoordinates.push(pathCoordinates[i], pathCoordinates[i + 1]);
                segments[segments.length - 1].valueData.push(valueData[i / 2]);
            }
        }

        return segments;
    },
}