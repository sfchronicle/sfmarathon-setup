var d3 = require('d3');
var $ = require("jquery");
require("component-responsive-frame/child");

var margin = {
  top: 15,
  right: 100,
  bottom: 25,
  left: 100
};
if (screen.width > 768) {
  var width = 900 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
} else if (screen.width <= 768 && screen.width > 480) {
  var width = 750 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
} else if (screen.width <= 480) {
  var margin = {
    top: 15,
    right: 10,
    bottom: 25,
    left: 45
  };
  var width = 310 - margin.left - margin.right;
  var height = 250 - margin.top - margin.bottom;

}

// show tooltip
var tooltip = d3.select(".elevation-finish-bubbles")
    .append("div")
    .attr("class","tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")

var raceData = raceCompData;
var allracedata = raceCompData;
var menracedata = raceCompData.filter(function(d) { return d.Gender == "M" });
var womenracedata = raceCompData.filter(function(d) { return d.Gender == "F" });

bubblechart();

$("#all").click(function(){
  $("#all").addClass("selected");
  $("#men").removeClass("selected");
  $("#women").removeClass("selected");
  raceData = null;
  raceData = allracedata;
});

$("#men").click(function(){
  $("#men").addClass("selected");
  $("#all").removeClass("selected");
  $("#women").removeClass("selected");
  raceData = null;
  raceData = menracedata;
});

$("#women").click(function(){
  $("#women").addClass("selected");
  $("#men").removeClass("selected");
  $("#all").removeClass("selected");
  raceData = null;
  raceData = womenracedata;
});

$("#bubbleoptions").click(function(){
  bubblechart();
});

//----------------------------------------------------------------------------------
// elevation vs finish time ------------------------------------
//----------------------------------------------------------------------------------

function bubblechart() {

  d3.select("#elevation-finish-bubbles").select("svg").remove();

  // Parse the date / time
  var parseFinishTime = d3.time.format("%H:%M:%S").parse;
  var formatthousands = d3.format("0,000");

  // convert strings to numbers
  raceData.forEach(function(d) {
    d.race = d.Race;
    d.gender = d.Gender;
    d.elevation = +d.Elevation;
    d.finishers = +d.Finishers2015;
    d.finishers_text = formatthousands(d.Finishers2015);
    d.finishtime = parseFinishTime(d.FinishTime);
  })

  // x-axis scale
  var xelev = d3.scale.linear()
      .rangeRound([0, width]);

  // y-axis scale
  var ypace = d3.time.scale()
      .range([height, 0]);

  if (screen.width <= 480) {
    // use x-axis scale to set x-axis
    var xAxisElev = d3.svg.axis()
        .scale(xelev)
        .orient("bottom")
        .tickFormat(function(d) {
            if ((d % 400) != 0) {
              return '';
            } else {
              return d;
            }
          });
  } else {
    // use x-axis scale to set x-axis
    var xAxisElev = d3.svg.axis()
        .scale(xelev)
        .orient("bottom");
  }

  if (screen.width < 480) {
    var yAxisTime = d3.svg.axis().scale(ypace)
        .orient("left")
        // .tickFormat(d3.time.format("%H:%M:%S"))
        // .tickFormat(function(d) {
        //     console.log(String(d)[20,22]);
        //     if (String(d)[22] != "0") {
        //       return '';
        //     } else {
        //       return d;
        //     }
        //   })
          .tickFormat(d3.time.format("%H:%M"));
  } else {
    var yAxisTime = d3.svg.axis().scale(ypace)
        .orient("left")
        .tickFormat(d3.time.format("%H:%M"));
  }


  // create SVG container for chart components
  var svgComp = d3.select(".elevation-finish-bubbles").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  xelev.domain([-100,1800]);
  ypace.domain([parseFinishTime('02:00:00'), parseFinishTime('03:20:00')]);

  svgComp.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisElev)
      .append("text")
      .attr("class", "label")
      .attr("x", width-10)
      .attr("y", -10)
      .style("text-anchor", "end")
      .text("Elevation gain (ft)");

  svgComp.append("g")
      .attr("class", "y axis")
      .call(yAxisTime)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", 10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Winning finish time");

  // color in the dots
  svgComp.selectAll(".dot")
      .data(raceData)
      .enter().append("circle")
      .attr("id", function(d) {
        return (d.race.replace(/\s/g, '').replace(/'/g, "").replace(/\(|\)/g, "").toLowerCase()+d.gender);
      })
      .attr("class","dot")
      .attr("r", function(d) {
        if (screen.width <= 480){
          return d.finishers/5000+7;
        } else {
          return d.finishers/2000+5;
        }
      })
      .attr("cx", function(d) {
        return xelev(d.elevation);
      })
      .attr("cy", function(d) { return ypace(d.finishtime); })
      .attr("opacity","0.7")
      .style("fill", function(d) {
        return color_gender(d.gender) || colors.fallback;
      })
      .on("mouseover", function(d) {
          tooltip.html(`
              <div>Race: <b>${d.race}</b></div>
              <div>Total finishers (M+F): <b>${d.finishers_text}</b></div>
              <div>Finish time: <b>${d.FinishTime}</b></div>
              <div>Gender: <b>${d.gender}</b></div>
          `);
          tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        if (screen.width <= 480) {
          return tooltip
            .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
            .style("left",10+"px");
        } else {
          return tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",(d3.event.pageX-80)+"px");
        }
      })
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  function color_gender(gender) {
    if (gender == "F") {
      return "#FFCC32";
    } else if (gender == "M"){
      return "#80A9D0";
    }
  }

  var node = svgComp.selectAll(".circle")
    .data(raceData)
    .enter().append("g")
    .attr("class","node");

  node.append("text")
    .attr("x", function(d) { return xelev(d.elevation)-20; })
    .attr("y", function(d) {return ypace(d.finishtime)+20; })
    .attr("class","dottext")
    .style("fill","#696969")
    .style("font-size","14px")
    .style("font-style","italic")
    .style("visibility",function(d) {
      if (d.race == "San Francisco") {
        return "visible"
      }
    })
    .text(function(d) {
        return ("SF ("+d.gender+")")
    });

  $(".dot").click(function(){
    $(".dot").removeClass("active");
    $(this).addClass("active");
  });

}
