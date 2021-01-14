import React, {useRef, useLayoutEffect} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as  am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
var _ = require('lodash');

function Graph (props) {

  // return null;
  const chart = useRef(null);

  console.log('Graph received posts ==>', props.posts.posts);
  console.log('Graph received activity ==>', props.activity);
  
  /**
   * This function creates a field called linkWidths
   * and populates it in a way suitable for further
   * graph rendering
   * @param {Object} result an object that will contain the new field and is modified in place
   * @param {Object} target an object that is used as input. Should contain an id field
   */
  const populateLinkWidths = (result, target) => {
    let width = result.linkWidths[target.id];
    if (!width) {
      result.linkWidths[target.id] = 1;
    }
    else {
      result.linkWidths[target.id] += 1;
      }
  }
  
  useLayoutEffect(() => {

    let x = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);
    let series = x.series.push(new am4plugins_forceDirected.ForceDirectedSeries());

    let test = _.cloneDeep(props.posts);


    let members = [];
    _.reduce(test.posts, function(result, post) {
      // Is the member already in the result?
      let ind = _.findIndex(result, ['name', post.writer.username]);
      // if so, increment posts and establish link
      if (ind !== -1) {
        result[ind].postsCount += 1;
        if (post.parentPost !== null) {
          populateLinkWidths(result[ind], post.parentPost.writer);
        }
      }
      // otherwise create new entry
      else { 
        result.push({
          name: post.writer.username, 
          id: post.writer.id,
          postsCount: 1,
          interCount: 0,
          linkWidths: (!!post.parentPost ? {[post.parentPost.writer.id]: 1} : {}),
        })
      }
      if (post.interactions && post.interactions.length > 0) {
        post.interactions.forEach(interaction => {
          let ind = _.findIndex(result, ['name', interaction.actor.username]);
          if (ind === -1) { 
            result.push({
            name: interaction.actor.username, 
            id: interaction.actor.id,
            postsCount: 0,
            interCount: 1,
            linkWidths: {[post.writer.id]: 1},
            })
          }
          else {
            result[ind].interCount += 1;
            populateLinkWidths(result[ind], post.writer);
          }
        });
      }
      return result;
    }, members); 
    // Generating a links field for each member that holds just ids
    // members.forEach(member => {member.links = Object.keys(member.linkWidths)});

    console.log('membInt graph', props.memberInteractions);

    _.reduce(props.memberInteractions, (result, interaction) => {
      let ind = _.findIndex(result, ['name', interaction.actor.username]);
      if (ind !== -1) { 
        result[ind].interCount += 1;
        populateLinkWidths(result[ind], interaction.actor);
      }
      else {
        result.push({
          name: interaction.actor.username,
          id: interaction.actor.id,
          postsCount: 0,
          interCount: 1,
          linkWidths: {[interaction.receiver.id]: 1},
        });
      }
      return result;
    }, members)
    console.log('members ==>', members);
    members.forEach(member => {member.links = Object.keys(member.linkWidths)});
    
    // fix the links width and links to fetch from a single field instead of two?
    // fix adding links for self likes?
    // const addActivity = (sourceQuery, targetArray) => {};
    let activity = [{
      name: props.activity.name,
      id: props.activity.id,
      postsCount: test.posts.length,
      interCount: 0,
      children: [],
    }];

    console.log('activity ==>', activity);
    
    _.reduce(props.activity.interactions, function(result, interaction) {

      let ind = _.findIndex(result, ['name', interaction.actor.username]);
      // if not found, create a new entry
      if (ind !== -1) { 
        result[ind].interCount += 1;
        populateLinkWidths(result[ind], interaction.actor);
      }
      else {
        result.push({
          name: interaction.actor.username,
          id: interaction.actor.id,
          postsCount: 0,
          interCount: 1,
          linkWidths: {[activity[0].id]: 1},
        });
      }
      return result;
    }, activity[0].children);

    activity[0].children.forEach(child => {child.links = Object.keys(child.linkWidths);});

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
      return widthTotal;
    })

    series.links.template.tooltipText = "Width: [b]{strokeWidth}[/]";
    series.links.template.interactionsEnabled = true;
    series.nodes.template.label.text = "{name}";
    series.nodes.template.label.hideOversized = true;
    series.nodes.template.label.truncate = true;
    series.nodes.template.tooltipText = "Post count: {postsCount}\nInteraction count: {interCount}";
    series.fontSize = 12;
    series.minRadius = 30;
    series.centerStrength = 0.3;
    series.manyBodyStrength = -50;

    chart.current = x;

    return () => {
      x.dispose();
    };
  }, [props.posts, props.activity]);

  return (
    <div id="chartdiv" style={{ width: "100%", height: "600px", }}></div>
  );
}

export default Graph;