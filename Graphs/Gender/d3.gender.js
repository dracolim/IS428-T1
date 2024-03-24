// set the dimensions and margins of the graph
const margin = {
        top: 30,
        right: 30,
        bottom: 60,
        left: 60
    },
    width_gender = 500 - margin.left - margin.right,
    height_gender = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg2 = d3.select("#gender_bar")
    .append("svg")
    .attr("width", width_gender + margin.left + margin.right)
    .attr("height", height_gender + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// tooltip
let tooltip_gender = d3.select("#gender_bar")
    .append("div")
    .attr("id", "tooltip");

// Parse the Data
d3.csv("../../Data/gender_frequency_tech.csv").then(function (data) {
    // Calculate total count
    const totalCount = d3.sum(data, d => +d.Value);

    // X axis
    const x = d3.scaleBand()
        .range([0, width_gender])
        .domain(data.map(d => d.Gender))
        .padding(0.2);

    svg2.append("g")
        .attr("transform", `translate(0,${height_gender})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add X axis label:
    svg2.append("text")
        .attr("text-anchor", "end")
        .attr("x", width_gender)
        .attr("y", height_gender + margin.top + 20)
        .text("Gender");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 1000])
        .range([height_gender, 0]);

    svg2.append("g")
        .call(d3.axisLeft(y));

    // Y axis label:
    svg2.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - 50)
        .text("Number of Respondents");

    // Bars
    svg2.selectAll("mybar")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.Gender))
        .attr("width", x.bandwidth())
        .attr("fill", "#EC4141")
        .attr("height", d => height_gender - y(0))
        .attr("y", d => y(0))
        .on("mouseover", (event, d) => {
            tooltip_gender.transition()
                .style("visibility", "visible");
            tooltip_gender.html("<strong>" + d.Gender + "</strong></br>" + d.Value)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip_gender.style("visibility", "hidden"));

    // Add percentage labels
    svg2.selectAll(".percentage")
        .data(data)
        .join("text")
        .attr("class", "percentage")
        .attr("x", d => x(d.Gender) + x.bandwidth() / 2)
        .attr("y", d => y(d.Value) - 10)
        .attr("text-anchor", "middle")
        .text(d => ((+d.Value / totalCount) * 100).toFixed(1) + "%");

    // Animation
    svg2.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", d => y(d.Value))
        .attr("height", d => height_gender - y(d.Value))
        .delay((d, i) => {
            return i * 100;
        });
});