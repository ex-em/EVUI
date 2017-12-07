/**
 * Original Code
 * https://github.com/gionkunz/chartist-js.git
 * chartist-js/src/scripts/axes/axis.js
 * modified by jykim
 */

import Svg from '../Svg';
import { AXIS_UNITS } from '../Constant';

class Axis {

    constructor(type, chartRect, ticks, options) {
        this.units = AXIS_UNITS[type];
        this.counterUnits = type === 'x' ? AXIS_UNITS.y: AXIS_UNITS.x;
        this.chartRect = chartRect;
        this.axisLength = chartRect[this.units.rectEnd] - chartRect[this.units.rectStart];
        this.gridOffset = chartRect[this.units.rectOffset];
        this.ticks = ticks;
        this.options = options;
    }

    createLabel(labelGroup, position, label, length, axisOffset, labelOffset) {
        let attribute = {},
            labelElement, content;

        attribute[this.units.pos] = position + labelOffset[this.units.pos];
        attribute[this.counterUnits.pos] = labelOffset[this.counterUnits.pos];
        attribute[this.units.len] = length;
        attribute[this.counterUnits.len] = Math.max(0, axisOffset - 10);
        attribute['overflow'] = 'visible';

        content = document.createElement('span');
        content.setAttribute('xmlns', 'http://www.w3.org/2000/xmlns/');
        content.className = 'label';
        content.textContent = label;
        content.style[this.units.len] = Math.round(attribute[this.units.len]) + 'px';
        content.style[this.counterUnits.len] = Math.round(attribute[this.counterUnits.len]) + 'px';

        labelElement = Svg.createElement(labelGroup, 'foreignObject', attribute, null);
        labelElement.appendChild(content);
    }

    createGrid(gridGroup, position, length) {
        let attribute = {};

        attribute[this.units.pos + '1'] = position;
        attribute[this.units.pos + '2'] = position;
        attribute[this.counterUnits.pos + '1'] = this.gridOffset;
        attribute[this.counterUnits.pos + '2'] = this.gridOffset + length;
        attribute['class'] = 'grid-line';

        Svg.createElement(gridGroup, 'line', attribute, null);
    }

    createAxis(gridGroup, axisGroup) {
        let options = this.options,
            computedValues = this.ticks.map(this.getValue.bind(this)),
            labelValues = this.ticks.map(options.tickFormat),
            labelOffset = {},
            ix, ixLen, labelLength, computedValue;

        labelLength = this.axisLength / labelValues.length;

        for (ix = 0, ixLen = computedValues.length; ix < ixLen; ix++) {
            computedValue = computedValues[ix];

            if (this.units.pos === 'x') {
                computedValue = this.chartRect.x1 + computedValue;

                if (options.labelAlign === 'between') {
                    labelOffset.x = options.labelOffset.x ;
                }
                else {
                    labelOffset.x = options.labelOffset.x - labelLength / 2;
                }

                if (options.position === 'start') {
                    labelOffset.y = this.chartRect.padding.top + options.labelOffset.y + 5;
                }
                else {
                    labelOffset.y = this.chartRect.y1 + options.labelOffset.y + 5;
                }
            }
            else {
                computedValue = this.chartRect.y1 - computedValue;
                labelOffset.y = options.labelOffset.y - labelLength / 2;

                if (options.position === 'start') {
                    labelOffset.x = this.chartRect.padding.left + options.labelOffset.x;
                }
                else {
                    labelOffset.x = this.chartRect.x2 + options.labelOffset.x + 10;
                }
            }

            if (ix === 0) {
                this.createGrid(gridGroup, computedValue, this.chartRect[this.counterUnits.len]());
            }
            else {
                if (options.showGrid) {
                    this.createGrid(gridGroup, computedValue, this.chartRect[this.counterUnits.len]());
                }
            }

            this.createLabel(axisGroup, computedValue, labelValues[ix], labelLength, options.offset, labelOffset);
        }
    }

}

export default Axis;
