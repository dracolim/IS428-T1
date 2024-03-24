///// TO FORMAT DATA /////
function groupAge(age) {
    if (age <= 20) return "0-20";
    else if (age <= 30) return "21-30";
    else if (age <= 40) return "31-40";
    else if (age <= 50) return "41-50";
    else if (age <= 60) return "51-60";
    else if (age <= 70) return "61-70";
    else if (age <= 80) return "71-80";
    else if (age <= 90) return "81-90";
    else return "91-100";
}

function convertGender(gender) {
    const genderMap = {
        1: 'Male',
        2: 'Female',
        3: 'Non-Binary',
    };
    return genderMap[gender] || 'Non-Binary'; // Default case
}

function convertTechCompany(answer) {
    const TechCompanyMap = {
        1: 'Works in tech company',
        0: 'Does not work in tech company',
    };
    return TechCompanyMap[answer]; // Default case
}

///// MAIN GRAPH BUILDER /////
function createSankeyChart(graph) {
    const single_color = "#eee"
    const width = 800;
    const height = 450;
    const sankey = d3.sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(4)
        .nodePadding(20)
        .extent([
            [0, 5],
            [width, height - 5]
        ]);

    const color = d3.scaleOrdinal(["Does not work in tech company", "Works in tech company"], ["#F7C5CD", "#CAF7C5"]).unknown("#ccc")

    const svg = d3.select("#sankey").append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;");

    const {
        nodes,
        links
    } = sankey({
        nodes: graph.nodes.map(d => Object.assign({}, d)),
        links: graph.links.map(d => Object.assign({}, d))
    });

    svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .append("title")
        .text(d => `${d.name}\n${d.value.toLocaleString()}`);

    const path = svg.append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(links)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", single_color)
        .attr("stroke-width", d => d.width)
        .style("mix-blend-mode", "multiply")
        .on("mouseover", function (event, d) {
            if (d) {
                path.attr("stroke", l => {
                    if (l.names[0] === d.names[0]) {
                        return color(d.names[0]);
                    } else {
                        return single_color;
                    }
                });
            }
        })
        .on("mouseout", d => {
            path.attr("stroke", single_color);
        });

    path.append("title")
        .text(d => `${d.names.join(" -> ")}\n${d.value.toLocaleString()}`);
    
    const label = svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name)
        .attr("fill", "#000")
        .append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${d.value.toLocaleString()}`);

    return svg.node();
}

function prepareGraph(data) {
    const countryColumnName = "what country do you work in?";
    const ageColumnName = "what is your age?";
    const genderColumnName = "what is your gender?";
    const techCompanyColumnName = "was your employer primarily a tech company/organization?";
    const keys = ["was your employer primarily a tech company/organization?", "what country do you work in?", "what is your age?", "what is your gender?"];
    let index = -1;
    const nodes = [];
    const nodeByKey = new Map();
    const indexByKey = new Map();
    const links = [];

    // Format data
    data.forEach(row => {
        row["what is your gender?"] = convertGender(row["what is your gender?"]);
        row["was your employer primarily a tech company/organization?"] = convertTechCompany(row["was your employer primarily a tech company/organization?"]);

        // Apply age grouping
        const age = parseInt(row["what is your age?"], 10);
        if (!isNaN(age)) { // Ensure age is a number
            row["what is your age?"] = groupAge(age);
        }
    });

    // Step 1: Count the frequency of each country
    const countryFrequency = data.reduce((acc, row) => {
        acc[row[countryColumnName]] = (acc[row[countryColumnName]] || 0) + 1;
        return acc;
    }, {});

    // Step 2: Sort countries by frequency and select the top 10
    const topCountries = Object.entries(countryFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);

    // Filter data to include only the top 10 countries
    data = data.filter(row => topCountries.includes(row[countryColumnName]));

    // Continue with the rest of the prepareGraph function as before
    for (const k of keys) {
        for (const d of data) {
            const key = JSON.stringify([k, d[k]]);
            if (nodeByKey.has(key)) continue;
            const node = {
                name: d[k]
            };
            nodes.push(node);
            nodeByKey.set(key, node);
            indexByKey.set(key, ++index);
        }
    }

    for (let i = 1; i < keys.length; ++i) {
        const a = keys[i - 1];
        const b = keys[i];
        const prefix = keys.slice(0, i + 1);
        const linkByKey = new Map();
        for (const d of data) {
            const names = prefix.map(k => d[k]);
            const value = d.value || 1;
            const key = JSON.stringify(names);
            let link = linkByKey.get(key);
            if (link) {
                link.value += value;
                continue;
            }
            link = {
                source: indexByKey.get(JSON.stringify([a, d[a]])),
                target: indexByKey.get(JSON.stringify([b, d[b]])),
                names,
                value
            };
            links.push(link);
            linkByKey.set(key, link);
        }
    }

    return {
        nodes,
        links
    };
}

d3.csv("../../Data/cleaned_data.csv").then(data => {
    data.forEach(d => d.value = +d.value); // Convert string to number if necessary

    // Process the data for the Sankey diagram
    const graph = prepareGraph(data);

    // Generate and display the Sankey diagram
    createSankeyChart(graph, "#sankey");
}).catch(error => console.error("Error loading the CSV file:", error));