// set the dimensions and margins of the graph
var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
},
width = 300 - margin.left - margin.right;
height = 350 - margin.top - margin.bottom;

var maxEmotions = 10;

// format variables
var formatNumber = d3.format(",.0f"), // zero decimal places
format = function (d) {
    return formatNumber(d);
},
color = d3.scaleOrdinal(d3.schemeCategory10);

// load the data
function SankeyUpdate() {
d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-emotion-reddit-posts/main/subreddit_emotion_2.csv", function (error, data) {


    // append the svg object to the body of the page
    function updateGraph(filter_value) {
		

		
        document.getElementById("container-graph").innerHTML = "";
        var svg = d3.select("#container-graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        const defs = svg.append('defs');
        // Set the sankey diagram properties
        var sankey = d3.sankey()
            .nodeWidth(25)
            .nodePadding(height / 25) // ADJUST PADDING HERE
            .size([width, height]);

        var path = sankey.link();

        //set up graph in same style as original example but empty
        graph = {
            "nodes": [],
            "links": []
        };

        //dataGrouped = d3.group(data, d => d.target)
		if (filter_value==1){
			subreddit_val = document.getElementById("subreddit_filter").value;
			document.getElementById("subreddit_filter_main").value = subreddit_val;
			
			document.getElementById("subreddit_filter_page_2").value = subreddit_val;
			$("#subreddit_filter_main").selectpicker('refresh');
			$("#subreddit_filter_page_2").selectpicker('refresh');
			console.log(subreddit_val);
		}
		else if (filter_value==2){
			subreddit_val = document.getElementById("subreddit_filter_main").value;
			document.getElementById("subreddit_filter").value = subreddit_val;
			
			document.getElementById("subreddit_filter_page_2").value = subreddit_val;
			$("#subreddit_filter").selectpicker('refresh');
			$("#subreddit_filter_page_2").selectpicker('refresh');
		}
		else {
			subreddit_val = document.getElementById("subreddit_filter_page_2").value;
			document.getElementById("subreddit_filter").value = subreddit_val;
			document.getElementById("subreddit_filter_main").value = subreddit_val;
			$("#subreddit_filter").selectpicker('refresh');	
			$("#subreddit_filter_main").selectpicker('refresh');				
		}
        var data_filtered = data.filter(function (d) {
            if ((d.source == subreddit_val & d.value > 0))
                return d;
        }); //return d.source == 'legaladvice' });



		var nested_data = d3.nest()
			.key(function (d) {
			return d.target;
		})
			.rollup(function (leaves) {
			return d3.sum(leaves, function (d) {
				return parseFloat(d.value);
			})
		})
			.entries(data_filtered);
					
		top_emotions = nested_data.slice().sort((a, b) => d3.descending(a.value, b.value)).slice(0, maxEmotions).map(function (d) {
			return d.key;
		}); // Select top 10 emotions
		
		data_filtered = data_filtered.filter(function (d) {
            if (top_emotions.includes(d.target))
                return d;
        }); //return d.source == 'legaladvice' });
		
		
		var top3_emotions = top_emotions.filter(function(e) { return e !== 'neutral' }).slice(0, 3)
		
		var top1_post = data_filtered.filter(function (d) {
            if (top3_emotions[0] == d.target)
                return d;
        })[0].text;
		
		var top2_post = data_filtered.filter(function (d) {
            if (top3_emotions[1] == d.target)
                return d;
        })[0].text;
		
		var top3_post = data_filtered.filter(function (d) {
            if (top3_emotions[2] == d.target)
                return d;
        })[0].text;
		
		var emotion_map = { "love": "&#x2764",
							"joy": "&#x1F603",
							"fear": "&#x1F628",
							"disgust": "&#x1F922",
							"amusement": "&#x1F602",
							"disappointment": "&#x1F614",
							"annoyance": "&#x1F620",
							"sadness": "&#x1F622",
							"admiration": "&#x1F929",
							"confusion": "&#x1F635",
							"approval": "&#x1F44D",
							"disapproval": "&#x1F44E",
							"caring" : "&#x1f917",
							"curiosity": "&#x1F914",
							"optimism": "&#x1F91E",
							"anger": "&#x1F621",
							"excitement":"&#x1F603",
							"gratitude": "&#x1F64F",
							"amusement": "&#x1F923",
							"realization":"&#x1F92F"	
		}

		
		var color_1 = color(top3_emotions[0].replace(/ .*/, ""))
		var color_2 = color(top3_emotions[1].replace(/ .*/, ""))
		var color_3 = color(top3_emotions[2].replace(/ .*/, ""))
		var top_emotions_text = "<p><h2 style=\"color:" + color_1 + "\"> 1. " + top3_emotions[0] + " " + emotion_map[top3_emotions[0]] + "</h2><small>\"" + top1_post + "\"</small><br>" +
								"<h3 style=\"color:" + color_2 + "\"> 2. " + top3_emotions[1]  + " " + emotion_map[top3_emotions[1]] + "</h3> <small>\"" + top2_post + "\"</small><br>" +
								"<h4 style=\"color:" + color_3 + "\"> 3. " + top3_emotions[2] + " " + emotion_map[top3_emotions[2]] +"</h4> <small>\"" + top3_post + "\"</small></p>"

        document.getElementById("top-emotions").innerHTML = top_emotions_text;
		
        data_filtered['columns'] = ["source", "target", "value"];
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
                "value": +d.value,
				"text": d.text
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
            .sort(function (a, b) {
            return b.dy - a.dy;
        });

        link.transition()
			.attr("stroke-width", function (d) { 
                return Math.max(1, d.dy);
            });
			
			

        // add the link titles
        link.append("title")
        .text(function (d) {
            return format(d.value) + " " + d.target.name + " posts. " + "Example: \n" + d.text;
        });
		
	//	link.on("click", function (d, i){
		//		alert("alert");
			//	})
		

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
        .style("fill", function (d) { // TODO: Change Source color to match cloud
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
    document.getElementById("subreddit_filter").addEventListener("change", function(){
    updateGraph(1)});
    document.getElementById("subreddit_filter_main").addEventListener("change", function(){
    updateGraph(2)});
	document.getElementById("subreddit_filter_page_2").addEventListener("change", function(){
    updateGraph(3)});
    updateGraph();
});
}