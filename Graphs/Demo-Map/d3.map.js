let urlEduData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
let urlCountyData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const w = 960;
const h = 600;


//API requests here, need to use Promise.all() on api requests : "we can pass in an array of promises. When all of them have resolved (or one fails), it will run our callback functions."
Promise.all(
        [d3.json(urlCountyData), d3.json(urlEduData)])
    .then((dataset) => ready(dataset[0], dataset[1]))
    .catch(err => console.log(err));

// countyData = dataset[0], eduData = dataset[1]
let ready = (countyData, eduData) => {
    //all the variables I need
    let size = 20;
    let domain = [10, 20, 30, 40, 50, 60, 70];
    const path = d3.geoPath(); //very very important to draw the map
    //in countyData
    const obj = countyData.objects; //array of all obj in countyData
    const counties = obj.counties;
    const bOrH = eduData.map(d => d.bachelorsOrHigher); //an array of all bachelors status

    //gets the colors for our map 
    const colorScale = d3.scaleThreshold()
        .domain(domain)
        .range(d3.schemeGreens[8]); //d3.schemeColor just returns an array of colors

    const data = topojson.feature(countyData, counties).features; // https://github.com/topojson/topojson, this is the data d3 needs to draw the map

    //my choropleth container
    const svg = d3.select("#choropleth")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
    //my tooltip
    let tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip");

    //the actual map
    let usCounties = svg.append("g")
        .selectAll("path")
        .attr("class", "counties")
        .data(data)
        .enter()
        .append("path") //super important
        .attr("class", "county")
        .attr("d", path) // super important
        .attr("data-fips", (d, i) => d.id)
        .attr("data-education", (d, i) => eduData.find(item => item.fips === d.id).bachelorsOrHigher) //need find() to match countyData with eduData !
        .attr("fill", (d, i) => colorScale(eduData.find(item => item.fips === d.id).bachelorsOrHigher) || 0)
        .on("mouseover", (event, d) => {
            const education = eduData.find(item => item.fips === d.id);
            tooltip.transition()
                .style("visibility", "visible")
                .style("cursor", "default")
                .style("left", event.pageX + 0 + "px")
                .style("top", event.pageY - 150 + "px")
                .attr("data-education", education.bachelorsOrHigher)
                .text(() => "State: " + education.state + ", Area: " + education.area_name + ", " + education.bachelorsOrHigher + "%")
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    //legend part
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
        .attr("y", (d, i) => 310 + i * (size)) // 310 is where the first rect appears. size is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .attr("fill", d => legendScale(d));

    //legend axis in %
    const legendDomain = [2.6, 75.1];
    const yScale = d3.scaleLinear()
        .domain(legendDomain)
        .range([310, 449]);

    const yAxis = d3.axisLeft(yScale)
        .tickValues(legendDomain)
        .tickFormat(d => d + " %")
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