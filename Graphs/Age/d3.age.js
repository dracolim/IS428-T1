// set the dimensions and margin_ages of the graph
const margin_age = {
        top: 30,
        right: 30,
        bottom: 60,
        left: 60
    },
    width_age = 500 - margin_age.left - margin_age.right,
    height_age = 450 - margin_age.top - margin_age.bottom;

// append the svg3 object to the body of the page
const svg3 = d3.select("#age_bar")
    .append("svg")
    .attr("width", width_age + margin_age.left + margin_age.right)
    .attr("height", height_age + margin_age.top + margin_age.bottom)
    .append("g")
    .attr("transform", `translate(${margin_age.left},${margin_age.top})`);

// tooltip
let tooltip_age = d3.select("#age_bar")
    .append("div")
    .attr("id", "tooltip");

// Parse the Data
d3.csv("../../Data/age_gender_tech.csv").then(function (data) {
    // List of subgroups = header of the csv files = soil condition here
    const subgroups = data.columns.slice(1);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = data.map(d => d.Age);

    // Add X axis
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width_age])
        .padding([0.2]);

    svg3.append("g")
        .attr("transform", `translate(0, ${height_age})`)
        .call(d3.axisBottom(x).tickSize(0));

    // Add X axis label:
    svg3.append("text")
        .attr("text-anchor", "end")
        .attr("x", width_age / 2 + 20)
        .attr("y", height_age + margin.top + 10)
        .text("Age Group");

    // Find the maximum value in the data
    const maxValue = d3.max(data, d => d3.max(subgroups, key => +d[key]));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 400])
        .range([height_age, 0]);

    svg3.append("g")
        .call(d3.axisLeft(y));

    // Y axis label:
    svg3.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin_age.left + 20)
        .attr("x", -margin_age.top - 50)
        .text("Number of Respondents");

    // Another scale for subgroup position?
    const xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05]);

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c', '#377eb8', '#4daf4a']);

    // Show the bars
    svg3.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${x(d.Age)}, 0)`)
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
        .attr("height", d => height_age - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", (event, d) => {
            tooltip_age.transition()
                .style("visibility", "visible");
            tooltip_age.html("<strong>" + d.key + "</strong></br>" + d.value)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip_age.style("visibility", "hidden"));
});