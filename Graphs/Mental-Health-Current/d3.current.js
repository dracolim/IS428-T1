// set the dimensions and margin_currents of the graph
const margin_current = {
        top: 20,
        right: 120,
        bottom: 100,
        left: 60
    },
    width_current = 500 - margin_current.left - margin_current.right,
    height_current = 400 - margin_current.top - margin_current.bottom;

// append the svg3 object to the body of the page
const svg3 = d3.select("#current")
    .append("svg")
    .attr("width", width_current + margin_current.left + margin_current.right)
    .attr("height", height_current + margin_current.top + margin_current.bottom)
    .append("g")
    .attr("transform", `translate(${margin_current.left},${margin_current.top})`);

// tooltip
let tooltip_country = d3.select("#current")
    .append("div")
    .attr("id", "tooltip");

// Parse the Data
d3.csv("../../Data/current_mental_health.csv").then(function (data) {
    const subgroups = data.columns.slice(1);

    // Add X axis
    const x = d3.scaleBand()
        .range([0, width_current])
        .domain(data.map(d => d.Country))
        .padding(0.2);

    svg3.append("g")
        .attr("transform", `translate(0,${height_current})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add X axis label:
    svg3.append("text")
        .attr("text-anchor", "end")
        .attr("x", width_current / 2 + 20)
        .attr("y", height_current + margin_current.top + 40)
        .text("Country");

    // Find the maximum value in the data
    const maxValue = d3.max(data, d => d3.max(subgroups, key => +d[key]));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 700])
        .range([height_current, 0]);

    svg3.append("g")
        .call(d3.axisLeft(y));

    // Y axis label:
    svg3.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin_current.left + 20)
        .attr("x", -margin_current.top - 50)
        .text("Number of Respondents");

    const xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05]);

    // one color per subgroup
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#EC4141', '#41A3EC']);

    // Show the bars
    svg3.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${x(d.Country)}, 0)`)
        .selectAll("rect")
        .data(function (d) {
            return subgroups.map(function (key) {
                return {
                    key: key,
                    value: d[key]
                };
            });
        })
        .join("rect")
        .attr("x", d => xSubgroup(d.key))
        .attr("y", d => y(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => height_current - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", (event, d) => {
            tooltip_country.transition()
                .style("visibility", "visible");
            tooltip_country.html("<strong>" + d.key + "</strong></br>" + d.value)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip_country.style("visibility", "hidden"));

    // Add legend
    const legendWidth = 80;
    const legendHeight = 50;
    const legendRectSize = 12;
    const legendSpacing = 5;

    const legend = svg3.append("g")
        .attr("transform", `translate(${width_current-20}, ${(height_current - legendHeight) / 2})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", "#ffffff")
        .attr("stroke", "#000000")
        .attr("stroke-width", 1);

    subgroups.forEach((subgroup, i) => {
        const yOffset = i * (legendRectSize + legendSpacing) + 10;

        legend.append("rect")
            .attr("x", 10)
            .attr("y", yOffset)
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .attr("fill", color(subgroup));

        legend.append("text")
            .attr("x", 10 + legendRectSize + 5)
            .attr("y", yOffset + legendRectSize / 2)
            .attr("dominant-baseline", "middle")
            .text(subgroup);
    });
});