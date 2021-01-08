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
        if (post.parentPost !== null) {
          let link = result[ind].links.find(link => link === post.parentPost.writer.id);
          let width = result[ind].linkWidths[post.parentPost.writer.id];
          if (!link) {
            result[ind].links.push(post.parentPost.writer.id);
          }
          if (!!width) {
            result[ind].linkWidths[post.parentPost.writer.id] += 1;
          }
          else {
            result[ind].linkWidths[post.parentPost.writer.id] = 1;
            }
        }
      }
      else { 
        result.push({
          username: post.writer.username,
          id: post.writer.id,
          postsCount: 1,
          links: (!!post.parentPost ? [post.parentPost.writer.id] : []),
          linkWidths: (!!post.parentPost ? {[post.parentPost.writer.id]: 1} : {}),
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

    series.links.template.adapter.add("strokeWidth", function(width, target) {
      let from = target.source;
      let to = target.target;
      let widths = from.dataItem.dataContext.linkWidths;
      if (widths && widths[to.dataItem.id]) {
        return widths[to.dataItem.id];
      }
      return width;
    })

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