// set the dimensions and margin_pasts of the graph
const margin_past = {
        top: 20,
        right: 120,
        bottom: 100,
        left: 60
    },
    width_past = 500 - margin_past.left - margin_past.right,
    height_past = 400 - margin_current.top - margin_current.bottom;

// append the svg4 object to the body of the page
const svg4 = d3.select("#past")
    .append("svg")
    .attr("width", width_past + margin_past.left + margin_past.right)
    .attr("height", height_past + margin_past.top + margin_past.bottom)
    .append("g")
    .attr("transform", `translate(${margin_past.left},${margin_past.top})`);

// tooltip
let tooltip_country2 = d3.select("#past")
    .append("div")
    .attr("id", "tooltip");

// Parse the Data
d3.csv("past_mental_health.csv").then(function (data) {
    const subgroups = data.columns.slice(1);

    // Add X axis
    const x = d3.scaleBand()
        .range([0, width_past])
        .domain(data.map(d => d.Country))
        .padding(0.2);

    svg4.append("g")
        .attr("transform", `translate(0,${height_past})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add X axis label:
    svg4.append("text")
        .attr("text-anchor", "end")
        .attr("x", width_past / 2 + 20)
        .attr("y", height_past + margin_past.top + 40)
        .text("Country");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 700])
        .range([height_past, 0]);

    svg4.append("g")
        .call(d3.axisLeft(y));

    // Y axis label:
    svg4.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin_past.left + 20)
        .attr("x", -margin_past.top - 50)
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
    svg4.append("g")
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
        .attr("height", d => height_past - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", (event, d) => {
            tooltip_country2.transition()
                .style("visibility", "visible");
            tooltip_country2.html("<strong>" + d.key + "</strong></br>" + d.value)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip_country2.style("visibility", "hidden"));

    // Add legend
    const legendWidth = 80;
    const legendHeight = 50;
    const legendRectSize = 12;
    const legendSpacing = 5;

    const legend = svg4.append("g")
        .attr("transform", `translate(${width_past-20}, ${(height_past - legendHeight) / 2})`);

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