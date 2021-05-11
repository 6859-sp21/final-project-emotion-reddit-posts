var needle;

(function(){

var barWidth, chart, chartInset, degToRad, repaintGauge,
    height, margin, numSections, padRad, percToDeg, percToRad, 
    percent, radius, sectionIndx, svg, totalPercent, width;

  percent = .65;
  numSections = 1;
  sectionPerc = 1 / numSections / 2;
  padRad = 0.025;
  chartInset = 10;

  // Orientation of gauge:
  totalPercent = .75;

  el = d3.select('#chart-gauge');

  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 0
  };

  width = el.node().offsetWidth - margin.left - margin.right;
  height = width /1.5;
  radius = Math.min(width, height) / 2;
  barWidth = 40 * width / 500;


  /*
    Utility methods 
  */
  percToDeg = function(perc) {
    return perc * 360;
  };

  percToRad = function(perc) {
    return degToRad(percToDeg(perc));
  };

  degToRad = function(deg) {
    return deg * Math.PI / 180;
  };

  // Create SVG element
  svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

  // Add layer for the panel
  chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left) / 2 - 50) + ", " + ((height + margin.top) / 2) + ")");
  chart.append('path').attr('class', "arc chart-filled");
  chart.append('path').attr('class', "arc chart-empty");

  arc2 = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
  arc1 = d3.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)

  repaintGauge = function (perc) 
  {
    var next_start = totalPercent;
    arcStartRad = percToRad(next_start);
    arcEndRad = arcStartRad + percToRad(perc / 2);
    next_start += perc / 2;


    arc1.startAngle(arcStartRad).endAngle(arcEndRad);

    arcStartRad = percToRad(next_start);
    arcEndRad = arcStartRad + percToRad((1 - perc) / 2);

    arc2.startAngle(arcStartRad + padRad).endAngle(arcEndRad);


    chart.select(".chart-filled").attr('d', arc1);
    chart.select(".chart-empty").attr('d', arc2);
  }


  var Needle = (function() {

    /** 
      * Helper function that returns the `d` value
      * for moving the needle
    **/
    var recalcPointerPos = function(perc) {
      var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
      thetaRad = percToRad(perc / 2);
      centerX = 0;
      centerY = 0;
      this.len = width / 3;
      this.radius = this.len / 6;	  
      topX = centerX - this.len * Math.cos(thetaRad);
      topY = centerY - this.len * Math.sin(thetaRad);
      leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
      leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
      rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
      rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
      return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    };

    function Needle(el) {
      this.el = el;
      this.len = width / 3;
      this.radius = this.len / 6;
    }

    Needle.prototype.render = function() {
      this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
      return this.el.append('path').attr('class', 'needle').attr('d', recalcPointerPos.call(this, 0));
    };

    Needle.prototype.moveTo = function(stars) {
		
      const perc = (stars / 5 - 0.4) * 2;

      var hue = ((1-(1-perc))*120).toString(10);
      const color = ["hsl(",hue,",100%,50%)"].join("");

      d3.select('.chart-filled').style("fill", color )
      
        var self,
        oldValue = this.perc || 0;

        this.perc = perc;
      self = this;

      // Reset pointer position
      this.el.transition().delay(300).duration(1500).select('.needle').tween('progress', function() {
        var needle = d3.select(this);
        return function(percentOfPercent) {
            var progress = oldValue + (percentOfPercent * (perc - oldValue));

            repaintGauge(progress);
            return needle.attr('d', recalcPointerPos.call(self, progress))
        };
    });
    };
	
    Needle.prototype.UpdateValue = function(stars) {
	d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-emotion-reddit-posts/main/subreddit_emotion_2.csv", function (error, data) {

        //dataGrouped = d3.group(data, d => d.target)
		subreddit_val = document.getElementById("subreddit_filter").value;
		$("#subreddit_filter_main").selectpicker('refresh');
		
        var data_filtered = data.filter(function (d) {
            if ((d.source == subreddit_val & d.value > 0))
                return d;
        }); 
	// Update Gauge
	
		var positivity_map = {
			"admiration":	1 ,
			"amusement":	1        ,
			"anger":	-1           ,
			"annoyance":	-1       ,
			"approval":	1            ,
			"caring":	1            ,
			"confusion":	0        ,
			"curiosity":	1        ,
			"desire":	1            ,
			"disappointment":	-1   ,
			"disapproval":	-1       ,
			"disgust":	-1           ,
			"embarrassment":	-1   ,
			"excitement":	1        ,
			"fear":	-1               ,
			"gratitude":	1        ,
			"grief":	-1           ,
			"joy":	1                ,
			"love":	1                ,
			"nervousness":	0        ,
			"optimism":	1            ,
			"pride":	1            ,
			"realization":	1        ,
			"relief":	1            ,
			"remorse":	-1           ,
			"sadness":	-1           ,
			"surprise":	1            ,
			"neutral":	0
		}
	

	var positivity_count = d3.nest()
			.key(function (d) {
			return "Total";
		})
			.rollup(function (leaves) {
			return d3.sum(leaves, function (d) {
				if (positivity_map[d.target] == 1){
				return parseFloat(d.value) * positivity_map[d.target] };
			})
		})
			.entries(data_filtered)[0].value;	
	var total_count = d3.nest()
			.key(function (d) {
			return "Total";
		})
			.rollup(function (leaves) {
			return d3.sum(leaves, function (d) {
				return parseFloat(d.value) * Math.abs(positivity_map[d.target]);
			})
		})
			.entries(data_filtered)[0].value;

      const perc = (positivity_count / total_count);

	  document.getElementById("positive_rate").textContent = (perc * 100).toFixed(0) + '%'
      var hue = ((1-(1-perc))*120).toString(10);
      const color = ["hsl(",hue,",100%,50%)"].join("");

      d3.select('.chart-filled').style("fill", color )
      
        var self,
        oldValue = this.perc || 0;

        this.perc = perc;
      self = this;

      // Reset pointer position
      this.el.transition().delay(300).duration(1500).select('.needle').tween('progress', function() {
        var needle = d3.select(this);
        return function(percentOfPercent) {
            var progress = oldValue + (percentOfPercent * (perc - oldValue));
            repaintGauge(progress);
            return needle.attr('d', recalcPointerPos.call(self, progress))
        };
    });
    });
	};
    return Needle;

  })();

  needle = new Needle(chart);
  needle.render();
})();