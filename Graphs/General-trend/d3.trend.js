const element = document.getElementById('trend');

// Dimensions
const margin_trend = {
        top: 40,
        right: 30,
        bottom: 70,
        left: 50
    },
    width_trend = 900 - margin_trend.left - margin_trend.right,
    height_trend = 300 - margin_trend.top - margin_trend.bottom;

// SVG_trend
const svg_trend = d3.select(element)
    .append('svg')
    .attr('width', width_trend + margin_trend.left + margin_trend.right)
    .attr('height', height_trend + margin_trend.top + margin_trend.bottom)
    .append('g')
    .attr('transform', `translate(${margin_trend.left}, ${margin_trend.top})`);

// Load data
d3.csv("../../Data/mental_health_responses_percentage_2017_to_2022.csv").then(data => {
    // Parse the date / time
    const parseTime = d3.timeParse("%Y");
    data.forEach(d => {
        d.date = parseTime(d.Year);
        d.total = +d["Percentage of Yes Responses"];
    });

    // Set the ranges
    const xScale = d3.scaleTime().range([0, width_trend]);
    const yScale = d3.scaleLinear().range([height_trend, 0]);

    // Define the line
    const valueline = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.total))
        .curve(d3.curveCatmullRom.alpha(0.5));

    // Scale the range of the data
    xScale.domain(d3.extent(data, d => d.date));
    yScale.domain([0, d3.max(data, d => d.total)]);

    // Add the valueline path.
    svg_trend.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline)
        .attr("stroke", "#ff6f3c")
        .attr("stroke-width_trend", 2)
        .style("fill", "none");

    // Add the X Axis
    svg_trend.append("g")
        .attr("transform", "translate(0," + height_trend + ")")
        .call(d3.axisBottom(xScale));

    // Add the Y Axis
    svg_trend.append("g")
        .call(d3.axisLeft(yScale));
}).catch(error => {
    console.error('Error loading the CSV file:', error);
});