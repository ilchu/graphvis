import React, {useRef, useLayoutEffect} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as  am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
var _ = require('lodash');

function Graph (props) {

  // return null;
  const chart = useRef(null);

  console.log('Graph received ==>', props.data);
  
  
  useLayoutEffect(() => {

    let x = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);
    let series = x.series.push(new am4plugins_forceDirected.ForceDirectedSeries());

    
    let test = _.cloneDeep(props.data);

    let members = [];
    _.reduce(test.posts, function(result, post) {
      let ind = _.findIndex(result, ['username', post.writer.username]);
      if (ind !== -1) {
        result[ind].postsCount += 1;
        !!post.parentPost && result[ind].links.push(post.parentPost.writer.id)
      } else { 
        result.push({
          username: post.writer.username,
          id: post.writer.id,
          postsCount: 1,
          links: (!!post.parentPost ? new Array(post.parentPost.writer.id) : []),
        })
      }
      return result;
    }, members); 

    console.log('members ==>', members);
   
    test.posts.forEach((post) => {
      post.parentPost ? post.parentPost = new Array(post.parentPost.id) : delete post.parentPost;
    });

    
     
    console.log('test ==>', test);

    // series.data = test.posts;
    series.data = members;
    series.dataFields.name = "username";
    // series.dataFields.children = "childPosts";
    series.dataFields.id = "id";
    series.dataFields.linkWith = "links";
    series.dataFields.value = "postsCount"
    console.log('series.dataItems ==>', series.dataItems);

    series.nodes.template.label.text = "{username}";
    series.nodes.template.tooltipText = "Post count: {postsCount}";
    series.fontSize = 12;
    // series.minRadius = 30;
    // series.maxRadius = 120;

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