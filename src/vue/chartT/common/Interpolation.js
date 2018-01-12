/**
 * Original Code
 * https://github.com/gionkunz/chartist-js.git
 * chartist-js/src/scripts/interpolation.js
 * modified by jykim
 */

import Svg from './Svg';

export default {

    none: function(pathCoordinates) {
        let pathElements = [],
            ix, ixLen, currX, currY, element;

        for (ix = 0, ixLen = pathCoordinates.length; ix < ixLen; ix += 2) {
            currX = pathCoordinates[ix];
            currY = pathCoordinates[ix + 1];

            if (ix === 0) {
                element = Svg.moveElement(currX, currY, false);
            }
            else {
                element = Svg.lineElement(currX, currY, false);
            }

            pathElements.push(element);
        }

        return pathElements;
    }

};
