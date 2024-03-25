// set the dimensions and margins of the graph
const width = 400,
    height = 300,
    margin = 40;

// The radius of the pie plot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width, height) / 2 - margin;

const svg = d3.select("#current_pie")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2 - 50}, ${height / 2})`);

const data = {
    Yes: 66,
    No: 34,
};

// set the color scale
const color = d3.scaleOrdinal()
    .range(['#EC4141', '#41A3EC']);

// Compute the position of each group on the pie:
const pie = d3.pie()
    .value(function (d) {
        return d[1];
    });

const data_ready = pie(Object.entries(data));

// shape helper to build arcs:
const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg.selectAll('mySlices')
    .data(data_ready)
    .join('path')
    .attr('d', arcGenerator)
    .attr('fill', function (d) {
        return color(d.data[0]);
    })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
    .on("mouseover", function (event, d) {
        d3.select(this).transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`${d.data[0]}: ${d.data[1]}%`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
        d3.select(this).transition()
            .duration(500)
            .style("opacity", 0.7);
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

// Now add the annotation. Use the centroid method to get the best coordinates
svg.selectAll('mySlices')
    .data(data_ready)
    .join('text')
    .text(function (d) {
        return d.data[1] + "%";
    })
    .attr("transform", function (d) {
        return `translate(${arcGenerator.centroid(d)})`;
    })
    .style("text-anchor", "middle")
    .style("font-size", 17);

// Add legend
const legendWidth = 80;
const legendHeight = 50;
const legendRectSize = 12;
const legendSpacing = 5;

const legend = svg.append("g")
    .attr("transform", `translate(${radius + 20}, ${-legendHeight / 2})`);

legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", "#ffffff")
    .attr("stroke", "#000000")
    .attr("stroke-width", 1);

Object.keys(data).forEach((category, i) => {
    const yOffset = i * (legendRectSize + legendSpacing) + 10;

    legend.append("rect")
        .attr("x", 10)
        .attr("y", yOffset)
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .attr("fill", color(category));

    legend.append("text")
        .attr("x", 10 + legendRectSize + 5)
        .attr("y", yOffset + legendRectSize / 2)
        .attr("dominant-baseline", "middle")
        .text(category);
});

// Create a tooltip div
const tooltip = d3.select("#current_pie")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");