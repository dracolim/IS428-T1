var width = window.innerWidth * 0.6;
var height = window.innerHeight * 0.4;
var lowColor = '#ffcccc';
var highColor = '#990000';

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2 - 100, height / 2]) // center on screen
    .scale([700]); // scale down to see entire US

// Define path generator
var path = d3.geoPath() // converts GeoJSON to SVG paths
    .projection(projection);

// Create SVG element and append map to the SVG
var svg = d3.select("#choropleth")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMidYMid meet");


let tooltip = d3.select("#choropleth")
    .append("div")
    .attr("id", "tooltip");

d3.csv("../../Data/state_frequency.csv").then(function (data) {
    var dataArray = data.map(d => parseFloat(d.value));
    var minVal = d3.min(dataArray);
    var maxVal = d3.max(dataArray);
    var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor]);
    var stateFrequency = {};
    data.forEach(d => stateFrequency[d.state] = +d.value);

    // Load GeoJSON data and merge with states data
    d3.json("../../Data/us-states.json").then(function (json) {
        json.features.forEach(function (feature) {
            feature.properties.value = stateFrequency[feature.properties.name] || 0;
        });

        // Bind data to SVG and create paths per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", d => ramp(d.properties.value))
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(500)
                    .style("visibility", "visible");
                tooltip.html("<strong>State:</strong> " + d.properties.name + "<br/><strong>Number of Respondents:</strong> " + d.properties.value)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"));

        // Add a legend to the left side
        var legendWidth = 140,
            legendHeight = 250;

        var key = svg.append("g")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("class", "legend")
            .attr("transform", "translate(" + (width - legendWidth - 20) + "," + (height / 2 - legendHeight / 2) + ")");


        key.append("text")
            .attr("class", "legend-title")
            .attr("x", 0)
            .attr("y", -10)
            .text("Legend");

        var legend = key.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", highColor)
            .attr("stop-opacity", 1);

        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", lowColor)
            .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", legendWidth - 100)
            .attr("height", legendHeight)
            .style("fill", "url(#gradient)");

        var y = d3.scaleLinear()
            .range([legendHeight, 0])
            .domain([minVal, maxVal]);

        var yAxis = d3.axisRight(y);

        key.append("g")
            .attr("class", "y axis")
            .call(yAxis);
    });
}).catch(function (error) {
    console.log(error);
});

// Redraw the map when the window is resized
window.addEventListener("resize", function () {
    width = window.innerWidth * 0.8;
    height = window.innerHeight * 0.8;

    projection.translate([width / 2 - 100, height / 2])
        .scale(width * 0.8);

    path.projection(projection);

    svg.attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height);

    svg.selectAll("path")
        .attr("d", path);

    var legendTranslate = "translate(" + (width - 140 - 20) + "," + (height / 2 - 250 / 2) + ")";
    d3.select(".legend")
        .attr("transform", legendTranslate);
});