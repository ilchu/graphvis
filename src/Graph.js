import React, {useRef, useLayoutEffect} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as  am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";

function Graph (props) {

  // return null;
  const chart = useRef(null);

  console.log('Graph received ==>', props.data);
  
  
  useLayoutEffect(() => {

    let x = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);
    let series = x.series.push(new am4plugins_forceDirected.ForceDirectedSeries());
    series.data = props.data.posts;
    console.log('dataFields ==>', series.data);
    series.dataFields.name = "writer.username";
    series.dataFields.children = "childPosts"
    series.nodes.template.label.text = "{writer.username}";
    series.nodes.template.tooltipText = "Post id:\n{id}\nType:{type}";
    series.fontSize = 12;
    series.minRadius = 30;
    series.maxRadius = 120;

    chart.current = x;

    return () => {
      x.dispose();
    };
  }, []);

  return (
    <div id="chartdiv" style={{ width: "100%", height: "500px", }}></div>
  );
}

export default Graph;