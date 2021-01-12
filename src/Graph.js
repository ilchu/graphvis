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
      let ind = _.findIndex(result, ['name', post.writer.username]);
      if (ind !== -1) {
        result[ind].postsCount += 1;
        if (post.parentPost !== null) {
          let link = result[ind].links.find(link => link === post.parentPost.writer.id);
          let width = result[ind].linkWidths[post.parentPost.writer.id];
          if (!link) {
            result[ind].links.push(post.parentPost.writer.id);
          }
          if (!width) {
            result[ind].linkWidths[post.parentPost.writer.id] = 1;
          }
          else {
            result[ind].linkWidths[post.parentPost.writer.id] += 1;
            }
        }
      }
      else { 
        result.push({
          name: post.writer.username,
          id: post.writer.id,
          postsCount: 1,
          links: (!!post.parentPost ? [post.parentPost.writer.id] : []),
          linkWidths: (!!post.parentPost ? {[post.parentPost.writer.id]: 1} : {}),
        })
      }
      if (post.interactions && post.interactions.length > 0) {
        if (ind === -1) { 
          ind = result.length - 1;
        }
        post.interactions.forEach(interaction => {
          let link = result[ind].links.find(link => link === interaction.actor.id);
          let width = result[ind].linkWidths[interaction.actor.id];
          if (!link) {
            result[ind].links.push(interaction.actor.id);
          }
          if (!width) {
            result[ind].linkWidths[interaction.actor.id] = 1;
          }
          else {
            result[ind].linkWidths[interaction.actor.id] += 1;
            }
        })
      }
      return result;
    }, members); 

    console.log('members ==>', members);
    
    // fix the links width and links to fetch from a single field instead of two?
    // fix adding links for self likes?
    let activity = [{
      name: test.posts[0].activity.name,
      id: test.posts[0].activity.id,
      postsCount: test.posts.length,
      children: [],
    }];
    
    _.reduce(test.posts[0].activity.interactions, function(result, interaction) {

      let ind = _.findIndex(result, ['name', interaction.actor.username]);
      // if not found, create a new entry
      if (ind === -1) { 
        result.push({
          name: interaction.actor.username,
          id: interaction.actor.id,
          postsCount: 0,
          links: [],
          linkWidths: {[activity[0].id]: 1},
        });
      }
      // found element, update its links and linkWidths
      else {
      let link = result[ind].links.find(link => link === interaction.actor.id);
      let width = result[ind].linkWidths[interaction.actor.id];
      if (!link) {
        result[ind].links.push(interaction.actor.id);
      }
      if (!width) {
        result[ind].linkWidths[interaction.actor.id] = 1;
      }
      else {
        result[ind].linkWidths[interaction.actor.id] += 1;
        }
      }
      return result;
    }, activity[0].children);

    activity[0].children = [...activity[0].children, ...members];

    console.log('activ ==>', activity);

    console.log('test ==>', test);

    let test_members = [
      {id: "A",
      postsCount: 15,
      links: ["B"],
      linkWidths: {"B": 100},},
      {id: "B",
      postsCount: 5,
      links: ["A"],
      linkWidths: {"A": 9},},
    ]

    series.data = activity;
    // series.data = test_members;
    series.dataFields.name = "name";
    // series.dataFields.name = "id";
    // series.dataFields.children = "childPosts";
    series.dataFields.id = "id";
    series.dataFields.linkWith = "links";
    series.dataFields.value = "postsCount";
    series.dataFields.children = "children";
    console.log('series.dataItems ==>', series.dataItems);

    series.links.template.adapter.add("strokeWidth", function(width, target) {
      let from = target.source;
      let to = target.target;
      let widthsFrom = from.dataItem.dataContext.linkWidths;
      let widthsTo = to.dataItem.dataContext.linkWidths;
      // Should it really be 1? Does it lead to links where they should not be?
      let widthTotal = 1;
      if (widthsFrom && widthsFrom[to.dataItem.id]) {
        widthTotal += widthsFrom[to.dataItem.id];
      }
      if (widthsTo && widthsTo[from.dataItem.id]) {
        widthTotal += widthsTo[from.dataItem.id];
      }
      return widthTotal * 2;
    })

    series.links.template.tooltipText = "Width: [b]{strokeWidth}[/]";
    series.links.template.interactionsEnabled = true;
    series.nodes.template.label.text = "{name}";
    series.nodes.template.label.hideOversized = true;
    series.nodes.template.label.truncate = true;
    series.nodes.template.tooltipText = "Post count: {postsCount}\nName: {name}";
    series.fontSize = 12;
    series.minRadius = 30;
    // series.maxRadius = 120;

    chart.current = x;

    return () => {
      x.dispose();
    };
  }, [props.data]);

  return (
    <div id="chartdiv" style={{ width: "100%", height: "600px", }}></div>
  );
}

export default Graph;