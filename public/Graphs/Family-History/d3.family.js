function initchart() {
    var data = {
        _percentage: [0, 0, 0],
        children: null,
        value: 0,
        key: "",
        depth: 1
    };
    chart.refreshChart(data);
}

function mouseover(event, data) {
    // Update breadcrumb trail and opacity as before
    var c = getcrumbpath(data);
    i(c);
    d3.selectAll(".skills-sunburst path")
        .style("opacity", 0.3);
    sunburst.selectAll("path")
        .filter(function (a) {
            return c.indexOf(a) >= 0;
        })
        .style("opacity", 1);

    // Check if _percentage data is present, and if so, update the line chart
    console.log(data.data);
    if (data.data && Array.isArray(data.data._percentage)) {
        chart.refreshChart(data.data);
    } else {
        console.log("Percentage data not found for this node:", data);
    }
}


function mouseleave() {
    d3.selectAll("path")
        .on("mouseover", null);
    d3.selectAll("path")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .on("end", function () {
            d3.select(this).on("mouseover", mouseover);
        });
}

function getcrumbpath(a) {
    var temp = [];
    var c = a;
    while (c.parent) {
        temp.unshift(c);
        c = c.parent;
    }
    return temp;
}

function initbreadcrumb() {
    d3.select("#family")
        .append("svg")
        .attr("width", 500)
        .attr("height", 50)
        .attr("class", "trail");
}

function h(a, d3) {
    var c = [];
    c.push("0,0");
    c.push(r.w + ",0");
    c.push(r.w + r.t + "," + r.h / 2);
    c.push(r.w + "," + r.h);
    c.push("0," + r.h);
    if (d3 > 0) c.push(r.t + "," + r.h / 2);
    return c.join(" ");
}

function i(a) {
    var color = a[a.length - 1]._color;
    var len = a.length;
    var c = d3.select("#family .trail")
        .selectAll("g")
        .remove();
    c = d3.select("#family .trail")
        .selectAll("g")
        .data(a, function (d) {
            return d.key + d.depth;
        });
    var d = c.enter().append("g");
    d.append("polygon")
        .attr("points", h)
        .style("fill", function (d) {
            return d._color;
        });
    d.append("text")
        .attr("x", r.w / 2 + 2)
        .attr("y", r.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("class", "breadcumb-text")
        .style("fill", function (d) {
            return getcolor(d3.rgb(d._color)) < 150 ? "#fff" : "#000";
        })
        .text(function (d) {
            return d.key;
        });
    c.attr("transform", function (d, i) {
        return "translate(" + i * (r.w + r.s) + ", 0)";
    });
    c.exit().remove();
    d3.select(".trail").style("visibility", "");
}

function t(a, b) {
    var length = Math.max(a.length, b.length);
    var result = [];

    for (var i = 0; i < length; i++) {
        var valueA = i < a.length ? a[i] : 0;
        var valueB = i < b.length ? b[i] : 0;
        var combinedValue = valueA + valueB;
        result.push(combinedValue);
    }

    return result;
}

function u(data) {
    if (Array.isArray(data)) {
        return data;
    }

    var result = new Array(6).fill(0); // Assuming there are 6 years of data

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            result = t(result, u(data[key]));
        }
    }

    return result;
}

function getcolor(color) {
    return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
}

function k(a) {
    var c = ["#4CC3D9", "#FFC65D", "#7BC8A4", "#93648D", "#404040"];
    var d = [-0.1, -0.05, 0];
    if (a.depth == 1) {
        var e = c[coloralternative % 5];
        coloralternative++;
        return e;
    }
    if (a.depth > 1) {
        var f = d[a.value % 3];
        return d3.rgb(a.parent._color).brighter(0.2 * a.depth + f * a.depth);
    }
}

var l;
var chart = (function (d3) {
    function processdata(data) {
        console.log(data);
        var b = [];
        if (data && Array.isArray(data._percentage)) {
            data._percentage.forEach(function (percentage, index) {
                // Make sure we do not exceed the `i` array bounds.
                if (index < i.length) {
                    b.push({
                        p: percentage,
                        date: i[index]
                    });
                }
            });
        } else {
            // Log an error if data is not structured as expected.
            console.error('Data is not structured as expected:', data);
        }
        return b;
    }


    function c(b, c) {
        j.domain(d3.extent(b, function (d) {
            return d.date;
        }));
        k.domain([0, 100]);
        cpath.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + h + ")")
            .call(bottomtick)
            .append("text")
            .attr("x", 450)
            .attr("y", -8)
            .style("text-anchor", "end")
            .text("Time");
        cpath.append("g")
            .attr("class", "y-axis axis")
            .call(lefttick)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".91em")
            .style("text-anchor", "end")
            .text("Percentage");
        cpath.append("path")
            .datum(b)
            .attr("class", "line")
            .attr("id", "skills-chart-line")
            .attr("d", n)
            .attr("stroke", function () {
                return c._color;
            });
    }

    function refreshChart(data) {
        console.log('HELLO');
        var e = processdata(data);
        var f = d3.select("#skills-chart-line");
        if (f.node() === null) {
            c(e, data);
        } else {
            f.datum(e)
                .attr("d", n)
                .attr("stroke", function () {
                    return data._color;
                });
        }
    }

    var chart = {};
    var rect = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };
    var g = 500 - rect.left - rect.right;
    var h = 400 - rect.top - rect.bottom;
    var i = [2017, 2018, 2019, 2020, 2021, 2022];
    var j = d3.scaleLinear().range([0, g]);
    var k = d3.scaleLinear().range([h, 0]);
    var bottomtick = d3.axisBottom(j)
        .tickValues([2017, 2018, 2019, 2020, 2021, 2022])
        .tickFormat(d3.format(".0f"))
        .tickPadding(10)
        .tickSize(0);
    var lefttick = d3.axisLeft(k)
        .tickSize(0)
        .tickPadding(10)
        .tickValues([20, 40, 60, 80, 100, 120, 140, 160, 180, 200]);
    var n = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) {
            return j(d.date);
        })
        .y(function (d) {
            return k(d.p);
        });
    var cpath = d3.select(".skills-chart")
        .append("svg")
        .attr("width", g + rect.left + rect.right)
        .attr("height", h + rect.top + rect.bottom)
        .append("g")
        .attr("transform", "translate(" + rect.left + "," + rect.top + ")");

    chart.refreshChart = refreshChart;
    return chart;
})(d3);

var width_family = 560;
var height_family = 560;
var rad = Math.min(width_family, height_family) / Math.PI - 25;
var q = k;
var r = {
    w: 116,
    h: 30,
    s: 3,
    t: 7
};

var sunburst = d3.select(".skills-sunburst")
    .append("svg")
    .attr("width", width_family)
    .attr("height", height_family)
    .append("g")
    .attr("transform", "translate(" + width_family / 2 + "," + height_family / 2 + ")");

sunburst.append("circle")
    .attr("r", rad)
    .style("opacity", 0);

var t = function (a, b) {
    var c = [];
    var d = a.length;
    if (a.length !== b.length) {
        c = a.length > b.length ? a : b;
    } else {
        for (var e = 0; e < d; e++) {
            var f = Math.max(a[e], b[e]) - Math.abs(a[e] - b[e]) / 8;
            c.push(f);
        }
    }
    return c;
};

var u = function (a) {
    if (Array.isArray(a)) {
        return a;
    }
    var b = [];
    Object.values(a).forEach(function (value) {
        if (typeof value === 'object' && value !== null) {
            b = t(u(value), b);
        }
    });
    return b;
};


var arc = d3.arc()
    .startAngle(function (d) {
        return d.x0;
    })
    .endAngle(function (d) {
        return d.x1 - 0.01 / (d.depth + 0.5);
    })
    .innerRadius(function (d) {
        return rad / Math.PI * d.depth;
    })
    .outerRadius(function (d) {
        return rad / Math.PI * (d.depth + 1) - 1;
    });

var coloralternative = 0;
initbreadcrumb();

function formatDataForHierarchy(data) {
    if (Array.isArray(data)) {
        return {
            value: data.reduce((a, b) => a + b, 0)
        };
    } else if (typeof data === 'object') {
        var children = Object.keys(data).map(key => {
            return {
                name: key,
                ...formatDataForHierarchy(data[key])
            };
        });
        return {
            children: children
        };
    }
    return {
        value: 0
    };
}
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function calculatePercentages(node) {
    console.log(node);
    if (node.children) {
        node.children.forEach(calculatePercentages);
    } else {
        if (node.data.value instanceof Array) {
            var total = node.data.value.reduce((a, b) => a + b, 0);
            node.data._percentage = node.data.value.map(v => (v / total) * 100);
        }
    }
}


d3.json("../../Data/sunburst_data_2017_to_2022.json").then(function (skillsdata) {
    var formattedData = formatDataForHierarchy(skillsdata.Skills);

    console.log("Formatted data:", formattedData);
    var root = d3.hierarchy(formattedData)
        .sum(function (d) {
            return d.value;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

    console.log(root);
    calculatePercentages(root);
    console.log(root);

    // Now create the sunburst data
    var partition = d3.partition()
        .size([2 * Math.PI, rad])(root);

    // Bind the partitioned data to the path elements
    var path = sunburst.selectAll("path")
        .data(root.descendants())
        .enter().append("path")
        .attr("display", function (d) {
            return d.depth ? null : "none";
        }) // hide inner ring
        .attr("d", arc)
        .style("stroke", "#fff")
        .style("fill", function (d) {
            return colorScale(d.data.name);
        });

    console.log("Number of path elements:", path.size());

    path.append("path")
        .attr("d", arc)
        .attr("stroke", "#fff")
        .attr("fill", function (d) {
            d.data._color = q(d);
            return d.data._color;
        })
        .attr("fill-rule", "evenodd")
        .attr("display", function (d) {
            return d.children ? null : "none";
        })
        .on("mouseover", mouseover);

    path.append("text")
        .attr("transform", function (d) {
            var r = 180 * ((d.x0 + d.x1) / 2 - Math.PI / 2) / Math.PI;
            return "rotate(" + r + ")";
        })
        .attr("x", function (d) {
            return rad / Math.PI * d.depth;
        })
        .attr("dx", "6")
        .attr("dy", ".35em")
        .text(function (d) {
            return d.data.key;
        })
        .attr("display", function (d) {
            return d.children ? null : "none";
        })
        .on("mouseover", mouseover);

    d3.select(".skills-sunburst")
        .on("mouseleave", mouseleave);

    l = path.node().__data__.value;

    sunburst.append("circle")
        .attr("r", rad / Math.PI)
        .attr("opacity", 0);

    initchart();
});