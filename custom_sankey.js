// set the dimensions and margins of the graph
var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
},
width = 700 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

var maxEmotions = 10;

// format variables
var formatNumber = d3.format(",.0f"), // zero decimal places
format = function (d) {
    return formatNumber(d);
},
color = d3.scaleOrdinal(d3.schemeCategory10);

// load the data
d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-emotion-reddit-posts/main/subreddit_emotion_sample.csv", function (error, data) {

    var nested_data = d3.nest()
        .key(function (d) {
        return d.target;
    })
        .rollup(function (leaves) {
        return d3.sum(leaves, function (d) {
            return parseFloat(d.value);
        })
    })
        .entries(data);

    top_emotions = nested_data.slice().sort((a, b) => d3.descending(a.value, b.value)).slice(0, maxEmotions).map(function (d) {
        return d.key;
    }); // Select top 10 emotions

    // append the svg object to the body of the page
    function updateGraph() {
        d3.select("svg").remove();
        var svg = d3.select("#container-graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        const defs = svg.append('defs');
        // Set the sankey diagram properties
        var sankey = d3.sankey()
            .nodeWidth(45)
            .nodePadding(height / 25) // ADJUST PADDING HERE
            .size([width, height]);

        var path = sankey.link();

        //set up graph in same style as original example but empty
        graph = {
            "nodes": [],
            "links": []
        };

        //dataGrouped = d3.group(data, d => d.target)
        subreddit_val = document.getElementById("subreddit_filter").value;
        const data_filtered = data.filter(function (d) {
            if ((d.source == subreddit_val & d.value > 0) && (top_emotions.includes(d.target)))
                return d;
        }); //return d.source == 'legaladvice' });
        data_filtered['columns'] = ["source", "target", "value"];
        console.log(subreddit_val);
        data_filtered.forEach(function (d) {
            graph.nodes.push({
                "name": d.source
            });
            graph.nodes.push({
                "name": d.target
            });
            graph.links.push({
                "source": d.source,
                "target": d.target,
                "value": +d.value
            });

        });

        // return only the distinct / unique nodes
        graph.nodes = d3.keys(d3.nest()
                .key(function (d) {
                    return d.name;
                })
                .object(graph.nodes));

        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        // now loop through each nodes to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = {
                "name": d
            };
        });
        sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

        // add in the links
        var link_data = svg.append("g").selectAll(".link")
            .data(graph.links);
        var link = link_data
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function (d) {
            return Math.max(1, d.dy);
        })
            .sort(function (a, b) {
            return b.dy - a.dy;
        });

        // add the link titles
        link.append("title")
        .text(function (d) {
            return d.source.name + " → " +
            d.target.name + "\n" + format(d.value);
        });

        // add in the nodes
        var node_data = svg.append("g").selectAll(".node")
            .data(graph.nodes);
        var node = node_data
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
            .call(d3.drag()
                .subject(function (d) {
                    return d;
                })
                .on("start", function () {
                    this.parentNode.appendChild(this);
                })
                .on("drag", dragmove));

        // add the rectangles for the nodes
        node.append("rect")
        .attr("height", function (d) {
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            return d.color = color(d.name.replace(/ .*/, ""));
        })
        .style("stroke", function (d) {
            return d3.rgb(d.color).darker(2);
        })
        .append("title")
        .text(function (d) {
            return d.name + "\n" + format(d.value);
        });

        // add in the title for the nodes
        node.append("text")
        .attr("x", -6)
        .attr("y", function (d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) {
            return d.name;
        })
        .filter(function (d) {
            return d.x < width / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");
        node_data.exit().remove();
        // the function for moving the nodes
        function dragmove(d) {
            d3.select(this)
            .attr("transform",
                "translate("
                 + d.x + ","
                 + (d.y = Math.max(
                            0, Math.min(height - d.dy, d3.event.y))) + ")");
            sankey.relayout();
            link.attr("d", path);
        };

        link.style('stroke', (d, i) => {

            // make unique gradient ids
            const gradientID = `gradient${i}`;

            const startColor = d.source.color;
            const stopColor = d.target.color;

            const linearGradient = defs.append('linearGradient')
                .attr('id', gradientID);

            linearGradient.selectAll('stop')
            .data([{
                        offset: '10%',
                        color: startColor
                    }, {
                        offset: '90%',
                        color: stopColor
                    }
                ])
            .enter().append('stop')
            .attr('offset', d => {
                return d.offset;
            })
            .attr('stop-color', d => {
                return d.color;
            });

            return `url(#${gradientID})`;
        })
    }

    document.getElementById("subreddit_filter").addEventListener("change", updateGraph);
    updateGraph();
});