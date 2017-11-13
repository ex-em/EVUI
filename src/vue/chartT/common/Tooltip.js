import Util from "../common/Util"

export default {
    defaultOptions : {
        tooltipOffset: {
            x: 0,
            y: -20
        }
    },

    getTooltip: function($chart, options){
        let tooltipSelector,
            $toolTip,
            width, height;

        options = Util.extend(null, this.defaultOptions, options);

        tooltipSelector = (options.type == 'Line') ? 'ct-point' : 'ct-bar';
        $toolTip = document.querySelector('.chartist-tooltip');

        if (!$toolTip) {
            $toolTip = document.createElement('div');
            $toolTip.className = 'chartist-tooltip';
            document.body.appendChild($toolTip);
        }

        width = $toolTip.offsetWidth;
        height = $toolTip.offsetHeight;

        hide($toolTip);

        on('mouseover', tooltipSelector, function (event) {
            if(!options.tooltip) { return ; }

            let $point = event.target,
                tooltipText = '',
                seriesName = $point.getAttribute('ct:meta'),
                value = $point.getAttribute('ct:value'),
                time;

            if(options.tooltip.xFormat){
                time = options.tooltip.xFormat(parseInt(value.split(',')[0]))
            }else{
                time = value.split(',')[0]
            }

            tooltipText += '<div class="chartist-tooltip-meta">' + time + '</div>';

            tooltipText += '<div style="float:left;">';
            tooltipText += '    <div class="chartist-tooltip-series">' + seriesName;
            tooltipText += '        <span class="chartist-tooltip-series-color" style="background: ' + event.target.style.stroke + '"></span>'
            tooltipText += '        <span class="chartist-tooltip-series-text"> : </span>'
            tooltipText += '    </div>';
            tooltipText += '</div>';

            if(options.tooltip.yFormat){
                value = options.tooltip.yFormat(parseInt(value.split(',')[1]))
            }else{
                value = value.split(',')[1]
            }

            tooltipText += '<div class="chartist-tooltip-value">';
            tooltipText += '    <div>' + value + '</div>';
            tooltipText += '</div>';

            $toolTip.innerHTML = tooltipText;
            setPosition(event);
            show($toolTip);

            // Remember height and width to avoid wrong position in IE
            height = $toolTip.offsetHeight;
            width = $toolTip.offsetWidth;
        });

        on('mouseout', tooltipSelector, function () {
            hide($toolTip);
        });

        on('mousemove', null, function (event) {
            setPosition(event);
        });

        function on(event, selector, callback) {
            $chart.addEventListener(event, function (e) {
                if (!selector || hasClass(e.target, selector))
                    callback(e);
            });
        }

        function setPosition(event) {
            height = height || $toolTip.offsetHeight;
            width = width || $toolTip.offsetWidth;
            let offsetX = - width / 2 + options.tooltipOffset.x,
                offsetY = - height + options.tooltipOffset.y,
                anchorX, anchorY;

            var box = $chart.getBoundingClientRect();

            if(event.target.x2 && event.target.y2){
                anchorX = parseInt(event.target.x2.baseVal.value);
                anchorY = parseInt(event.target.y2.baseVal.value);
            }

            $toolTip.style.top = box.top + anchorY + window.pageYOffset + offsetY + 'px';
            $toolTip.style.left = box.left + anchorX + window.pageXOffset + offsetX + 'px';
        }

        function show(element) {
            if(!hasClass(element, 'tooltip-show')) {
                element.className = element.className + ' tooltip-show';
            }
        }

        function hide(element) {
            var regex = new RegExp('tooltip-show' + '\\s*', 'gi');
            element.className = element.className.replace(regex, '').trim();
        }

        function hasClass(element, className) {
            return (' ' + element.getAttribute('class') + ' ').indexOf(' ' + className + ' ') > -1;
        }
    }
}