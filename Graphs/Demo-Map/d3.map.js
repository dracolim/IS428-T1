let urlEduData = "../../cleaned_data.csv"
let urlStateData = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const w = 960;
const h = 600;

Promise.all([d3.json(urlStateData), d3.csv(urlEduData)])
    .then((dataset) => ready(dataset[0], dataset[1]))
    .catch(err => console.log(err));

let ready = (stateData, eduData) => {
    let size = 20;
    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([w / 2, h / 2]);

    const path = d3.geoPath()
        .projection(projection);

    // Count the frequency of respondents by state
    const stateFrequency = {};
    eduData.forEach(d => {
        const state = d["what us state or territory do you work in?"];
        if (state) {
            stateFrequency[state] = (stateFrequency[state] || 0) + 1;
        }
    });

    console.log(stateFrequency)

    // Get the minimum and maximum frequency values
    const frequencyValues = Object.values(stateFrequency);
    const minFrequency = Math.min(...frequencyValues);
    const maxFrequency = Math.max(...frequencyValues);

    // Set the domain for the color scale
    const domain = [0, 50, 100, 150];

    const colorScale = d3.scaleThreshold()
        .domain(domain)
        .range(d3.schemeGreens[8]);

    const data = stateData.features;

    const svg = d3.select("#choropleth")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    let tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip");

    let usStates = svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("data-name", d => d.properties.name)
        .attr("data-frequency", d => stateFrequency[d.properties.name] || 0)
        .attr("fill", d => colorScale(stateFrequency[d.properties.name] || 0))
        .attr("stroke", "black") // Add state borders
        .attr("stroke-width", 0.5) // Set border width
        .on("mouseover", (event, d) => {
            const frequency = stateFrequency[d.properties.name] || 0;
            tooltip.transition()
                .style("visibility", "visible")
                .style("cursor", "default")
                .style("left", event.pageX + 0 + "px")
                .style("top", event.pageY - 150 + "px")
                .attr("data-frequency", frequency)
                .text(() => "State: " + d.properties.name + ", Frequency: " + frequency)
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    let legendBox = svg.append("g")
        .attr("id", "legend");

    let legendScale = d3.scaleOrdinal()
        .domain(domain)
        .range(d3.schemeGreens[8]);

    let legend = legendBox.selectAll("rect")
        .data(domain)
        .enter()
        .append("rect")
        .attr("x", w - 20)
        .attr("y", (d, i) => 310 + i * (size))
        .attr("width", size)
        .attr("height", size)
        .attr("fill", d => legendScale(d));

    const legendDomain = [0, 50, 100,150];
    const yScale = d3.scaleLinear()
        .domain(legendDomain)
        .range([310, 330]);

    const yAxis = d3.axisLeft(yScale)
        .tickValues(legendDomain)
        .tickFormat(d => d)
        .tickSize(3);

    svg.append("g")
        .call(yAxis)
        .attr("transform", "translate(940, 0)");

    svg.append("text")
        .attr("x", w - 50)
        .attr("y", 300)
        .text("Legend: ")
        .attr("font-size", 12)
};