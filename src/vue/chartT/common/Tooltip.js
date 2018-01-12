import Util from '../common/Util';

export default {
    defaultOptions : {
        tooltipOffset: {
            x: 10,
            y: 0
        }
    },

    getTooltip: function(chartElement, options){
        let tooltipSelector,
            toolTipElement,
            width, height;

        options = Util.extend(null, this.defaultOptions, options);

        tooltipSelector = (options.type == 'Line') ? 'point' : 'bar';
        toolTipElement = document.querySelector('.tooltip');

        if (!toolTipElement) {
            toolTipElement = document.createElement('div');
            toolTipElement.className = 'tooltip';
            document.body.appendChild(toolTipElement);
        }

        width = toolTipElement.offsetWidth;
        height = toolTipElement.offsetHeight;

        hide(toolTipElement);

        on('mouseover', tooltipSelector, function (event) {
            if(!options.tooltip) { return ; }

            let $point = event.target,
                tooltipText,
                seriesName = $point.getAttribute('ct:meta'),
                value = $point.getAttribute('ct:value'),
                time;

            if(options.tooltip.xFormat){
                time = options.tooltip.xFormat(value.split(',')[0]);
            }else{
                time = value.split(',')[0];
            }

            if(options.tooltip.yFormat){
                value = options.tooltip.yFormat(parseInt(value.split(',')[1]));
            }else{
                value = value.split(',')[1];
            }

            tooltipText = `
                <div class="tooltip-meta"> ${ time } </div>
                <div class="tooltip-series" >
                    <div> ${ seriesName }
                       <span class="tooltip-series-color" style="background: ${ event.target.style.stroke }"></span>
                       <span class="tooltip-series-text"> : </span>
                    </div>
                </div>
                <div class="tooltip-value">
                    <div> ${ value } </div>
                </div>`;

            toolTipElement.innerHTML = tooltipText;
            setPosition(event);
            show(toolTipElement);

            // Remember height and width to avoid wrong position in IE
            height = toolTipElement.offsetHeight;
            width = toolTipElement.offsetWidth;
        });

        on('mouseout', tooltipSelector, function () {
            hide(toolTipElement);
        });

        on('mousemove', null, function (event) {
            setPosition(event);
        });

        function on(event, selector, callback) {
            chartElement.addEventListener(event, function (e) {
                if (!selector || hasClass(e.target, selector))
                    callback(e);
            });
        }

        function setPosition(event) {
            height = height || toolTipElement.offsetHeight;
            width = width || toolTipElement.offsetWidth;

            let offsetX = options.tooltipOffset.x,
                offsetY = - height / 2 + options.tooltipOffset.y,
                anchorX, anchorY, left, top,
                box = chartElement.getBoundingClientRect(),
                halfBoxWidth = box.width / 2;

            if(event.target.x2 && event.target.y2){
                anchorX = parseInt(event.target.x2.baseVal.value);
                anchorY = parseInt(event.target.y2.baseVal.value);
            }

            left = box.left + anchorX + window.pageXOffset;
            top = box.top + anchorY + window.pageYOffset;

            if(anchorX > halfBoxWidth) {
                toolTipElement.style.left = left - offsetX - toolTipElement.clientWidth + 'px';
            }else{
                toolTipElement.style.left = left + offsetX + 'px';
            }

            toolTipElement.style.top = top + offsetY + 'px';
        }

        function show(element) {
            if(!hasClass(element, 'tooltip-show')) {
                element.className = element.className + ' tooltip-show';
            }
        }

        function hide(element) {
            let regex = new RegExp('tooltip-show' + '\\s*', 'gi');
            element.className = element.className.replace(regex, '').trim();
        }

        function hasClass(element, className) {
            return (' ' + element.getAttribute('class') + ' ').indexOf(' ' + className + ' ') > -1;
        }
    }
};
