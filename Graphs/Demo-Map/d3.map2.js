const req = new XMLHttpRequest();
req.open("GET", 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json', true);
req.send();
req.onload = function () {
    let mapData = JSON.parse(req.responseText);

    // Load education data

    const req2 = new XMLHttpRequest();
    req2.open("GET", 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json', true);
    req2.send();
    req2.onload = function () {
        let eduData = JSON.parse(req2.responseText);

        let newMapData = topojson.feature(mapData, mapData.objects.counties).features;

        // console.log("newMapData:");
        // console.log(newMapData);
        // console.log("eduData:");
        // console.log(eduData);

        const w = 1200;
        const h = 600;
        const padding = 70;

        const svg = d3.select("#choropleth")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("align-self", "center");

        console.log(eduData.length);

        svg.selectAll("path")
            .data(newMapData)
            .enter()
            .append("path")
            .attr("d", d3.geoPath())
            .attr("class", d => handleGetBachelors(d))
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        function handleGetBachelors(d) {
            for (let i = 0; i < eduData.length; i++) {
                if (d.id == eduData[i].fips) {
                    return handleGetColor(eduData[i].bachelorsOrHigher);
                }
            }
        }

        function handleGetColor(x) {
            if (x <= 12) {
                return "color-01";
            } else if (x > 12 && x <= 21) {
                return "color-02";
            } else if (x > 21 && x <= 30) {
                return "color-03";
            } else if (x > 30 && x <= 39) {
                return "color-04";
            } else if (x > 39 && x <= 48) {
                return "color-05";
            } else if (x > 48 && x <= 57) {
                return "color-06";
            } else if (x > 57) {
                return "color-07";
            } else {
                return "color-error";
            }
        }

        var tooltip = d3.select("#choropleth")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "#edf8c2")
            .style("color", "black")
            .style("border", "solid")
            .style("border-width", "0px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("box-shadow", "2px 2px 20px")
            .style("opacity", "0.8")
            .attr("id", "tooltip");

        function handleMouseOver(event, d) {
            d3.select(this).attr("stroke", "black");
            tooltip
                .style("visibility", "visible")
                .style("top", (event.pageY - 40) + "px")
                .style("left", (event.pageX + 10) + "px")
                .html("<center> " + handleGetLocation(d.id) + " </center>");
        };

        function handleGetLocation(x) {
            for (let i = 0; i < eduData.length; i++) {
                if (x == eduData[i].fips) {
                    return eduData[i].area_name + ", " + eduData[i].state + ": " + eduData[i].bachelorsOrHigher + "%";
                }
            }
        }

        function handleMouseOut(event, d) {
            d3.select(this).attr("stroke", "none");
            tooltip.style("visibility", "hidden");
        };

        // Begin legend stuff  

        const legW = w / 5;
        const legH = 20;
        const legendColors = [12, 21, 30, 39, 48, 57, 66];

        let legend = svg.append("g")
            .attr("transform", "translate(900, 300)")
            .attr("id", "legend");

        let xScale = d3.scaleLinear()
            .domain([0, 70])
            .range([0, legW]);

        let xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(7)
            .tickSize(30)
            .tickFormat((d, i) => ['3%', '12%', '21%', '30%', '39%', '48%', '57%', '66%'][i]);

        legend.selectAll("rect")
            .data(legendColors)
            .enter()
            .append("rect")
            .attr("width", legW / legendColors.length)
            .attr("height", legH)
            .attr("x", (d, i) => i * (legW / legendColors.length))
            .attr("class", d => handleGetColor(d));

        legend.append("g")
            .call(xAxis);
    }
}