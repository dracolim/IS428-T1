// set the dimensions and margins of the graph
const width_past_pie = 400,
    heigh_past_pie = 300,
    margin_past_pie = 40;

// The radius of the pie plot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius_past = Math.min(width_past_pie, heigh_past_pie) / 2 - margin_past_pie;

const svg5 = d3.select("#past_pie")
    .append("svg")
    .attr("width", width_past_pie)
    .attr("height", heigh_past_pie)
    .append("g")
    .attr("transform", `translate(${width_past_pie / 2 - 50}, ${height / 2})`);

const data_past = {
    Yes: 67.7,
    No: 32.3,
};

// set the color scale
const color_past = d3.scaleOrdinal()
    .range(['#EC4141', '#41A3EC']);

// Compute the position of each group on the pie:
const pie_pas = d3.pie()
    .value(function (d) {
        return d[1];
    });

const data_ready_past = pie(Object.entries(data_past));

// shape helper to build arcs:
const arcGenerator_past = d3.arc()
    .innerRadius(0)
    .outerRadius(radius_past);

// Now add the annotation. Use the centroid method to get the best coordinates
svg5.selectAll('mySlices')
    .data(data_ready_past)
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
        tooltip5.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip5.html(`${d.data[0]}: ${d.data[1]}%`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
        d3.select(this).transition()
            .duration(500)
            .style("opacity", 0.7);
        tooltip5.transition()
            .duration(500)
            .style("opacity", 0);
    });

svg5.selectAll('mySlices')
    .data(data_ready_past)
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
const legendWidth_past = 80;
const legendHeight_past = 50;
const legendRectSize_past = 12;
const legendSpacing_past = 5;

const legend5 = svg5.append("g")
    .attr("transform", `translate(${radius_past + 20}, ${-legendHeight_past / 2})`);

legend5.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", legendWidth_past)
    .attr("height", legendHeight_past)
    .attr("fill", "#ffffff")
    .attr("stroke", "#000000")
    .attr("stroke-width", 1);

Object.keys(data_past).forEach((category, i) => {
    const yOffset = i * (legendRectSize_past + legendSpacing_past) + 10;

    legend5.append("rect")
        .attr("x", 10)
        .attr("y", yOffset)
        .attr("width", legendRectSize_past)
        .attr("height", legendRectSize_past)
        .attr("fill", color(category));

    legend5.append("text")
        .attr("x", 10 + legendRectSize_past + 5)
        .attr("y", yOffset + legendRectSize_past / 2)
        .attr("dominant-baseline", "middle")
        .text(category);
});

// Create a tooltip div
const tooltip5 = d3.select("#past_pie")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");