;(function ($, window, document, undefined) {
    // Declare variables:
    var pluginName, defaults;

    // Define the name of the plugin:
    pluginName = "d3plotxts";

    // Define default options:
    defaults = {
        margin: {top: 0, right: 0, bottom: 20, left: 40},
        width: 400,
        height: 400,
        datetimeFormat: "%Y-%m-%d",
        xAxisFormat: d3.time.format.multi([
            [".%L", function(d) { return d.getMilliseconds(); }],
            [":%S", function(d) { return d.getSeconds(); }],
            ["%I:%M", function(d) { return d.getMinutes(); }],
            ["%I %p", function(d) { return d.getHours(); }],
            ["%a %d", function(d) { return d.getDay() && d.getDate() !== 1; }],
            ["%b %d", function(d) { return d.getDate() !== 1; }],
            ["%B", function(d) { return d.getMonth(); }],
            ["%Y", function() { return true; }]
        ]),
        yAxisFormat: function (value) {
            return value;
        },
        colors: function () {
            return "#" + ((1 << 24) * Math.random() | 0).toString(16);
        },
        widths: function () {
            return 1;
        }
    };

    // Define the plugin constructor:
    function Plugin (element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Define the plugin prototype:
    Plugin.prototype = {
        init: function () {
            // Declare variables:
            var settings, canvasWidth, canvasHeight, plotWidth, plotHeight, parseDate, xScale, yScale, xAxis, yAxis, line, data, canvas, series;

            // Get the settings:
            settings = this.options;

            // Declare the canvas width/height:
            canvasWidth = settings.width;
            canvasHeight = settings.height;

            // Compute the plot width and height:
            plotWidth = settings.width - settings.margin.left - settings.margin.right;
            plotHeight = settings.height - settings.margin.top - settings.margin.bottom;

            // Create the parser:
            parseDate = d3.time.format(settings.datetimeFormat).parse;

            // Prapere the `x` scale:
            xScale = d3
                .time
                .scale()
                .range([0, plotWidth]);

            // Declare the `x` domain (we will change it later):
            xScale.domain([-1, 1]);

            // Prepate the `y` scale:
            yScale = d3
                .scale
                .linear()
                .range([plotHeight, 0]);

            // Declare the `y` domain (we will change it later):
            yScale.domain([-1, 1]);

            // Prapere the `x` axis:
            xAxis = d3
                .svg
                .axis()
                .scale(xScale)
                .tickFormat(settings.xAxisFormat)
                .orient("bottom");

            // Prepare the `y` axis:
            yAxis = d3
                .svg
                .axis()
                .scale(yScale)
                .tickFormat(settings.yAxisFormat)
                .orient("left");

            // Prepare the line drawer:
            line = d3
                .svg
                .line()
                .x(function(d) { return xScale(d.x); })
                .y(function(d) { return yScale(d.y); });

            // Parse the index:
            settings.data.Index = settings.data.Index.map(parseDate);

            // Get the data:
            data = this.reshapeData(settings.data);

            // Create the domain for xScale:
            xScale.domain(d3.extent(settings.data.Index));

            // Create the domain for yScale:
            yScale.domain(d3.extent(this.flattenY(data)));

            // Empty the HTML container:
            $(this.element).html("");

            // First, draw the SVG canvas:
            canvas = d3
                .select(this.element)
                .append("svg")
                .attr("width", canvasWidth)
                .attr("height", canvasHeight)
                .append("g")
                .attr("transform", "translate(" + settings.margin.left + ", " + settings.margin.top + ")");

            // Add `x` axis:
            canvas.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + plotHeight + ")")
                .call(xAxis);

            // Add `y` axis:
            canvas.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            // Prepare series canvas:
            series = canvas
                .selectAll(".series")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "series");

            // Plot lines:
            series.append("path")
                .attr("class", "line")
                .attr("d", function(d) { return line(d.values); })
                .style("stroke", function(d) { return settings.colors(d.name); })
                .style("stroke-width", function(d) { return settings.widths(d.name); });

            // Done, return for chaining:
            return this;
        },
        appendArrays: function (a1, a2) {
            a2.forEach (function (x) {
                a1.push(x);
            });
            return a1;
        },
        flattenY: function (data) {
            return data.map(function (series) {
                return series.values.map(function (d) {
                    return d.y;
                });
            }).reduce(this.appendArrays, []);
        },
        reshapeData: function (data) {
            // Declare variables:
            var datacp, rsData, index;

            // Copy data first:
            datacp = jQuery.extend(datacp, data);

            // Declare the return value:
            rsData = [];

            // Get the Index series:
            index = datacp.Index;
            delete datacp.Index;

            // Iterate over series and populate the return value:
            Object.keys(datacp).forEach(function (seriesName) {
                // Declare the series:
                var tmp = [], i = 0;

                // Populate values:
                for (i = 0; i < index.length; i++) {
                    tmp.push({
                        x: index[i],
                        y: datacp[seriesName][i]
                    });
                }

                // ADd series to the container:
                rsData.push({
                    name: seriesName,
                    values: tmp
                });
            });

            // Done, return the value:
            return rsData;
        }
    };

    // Protective wrapper for the plugin:
    $.fn[pluginName] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

})( jQuery, window, document );
