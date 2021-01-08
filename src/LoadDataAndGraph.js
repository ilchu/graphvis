import React from 'react';
import { gql, useQuery, useApolloClient} from "@apollo/client";
import Graph from "./Graph"

LoadDataAndGraph.fragments = {
  content: gql`
  fragment contentFields on PostContentDynamicZone {
    ... on ComponentPostCommentOnPost {
      __typename
      id
    }
    ... on ComponentPostReply {
      __typename
      replyTo {
        id
        username
      }
    }
    ... on ComponentPostCommentOnActivity {
      __typename
      id
    }
    ... on ComponentPostProposal {
      __typename
      id
    }
    ... on ComponentPostArticle {
      __typename
      id
    }
    ... on ComponentPostSingleChoiceAnswer {
      __typename
      id
    }
    ... on ComponentPostMultipleChoiceAnswer {
      __typename
      id
    }
    ... on ComponentPostTextAnswer {
      __typename
      id
    }
    ... on ComponentPostScaleAnswer {
      __typename
      id
    }
    ... on ComponentPostShortAnswer {
      __typename
      id
    }
  }
  `,
};

const getActivityQuery = gql`
  query getActivity($groupId: ID!, $actId: ID!) {
    activities (where: {group: $groupId, id: $actId}) {
      name
      posts {
        id
        writer {
          id
          username
        }
        content {
          ... contentFields
        }
        childPosts {
          id
          writer {
            id
            username
          }
        }
        interactions {
          type
          actor {username}
          }
      }
    }
  }
  ${LoadDataAndGraph.fragments.content}
  `;

const GROUP_ID = "5fe17e24563de738c3a21661";
const ACT_ID = "5fe3e6f8563de738c3a21774";

const getPostsQuery = gql`
  query getPosts($actId: ID!) {
    posts(where: {activity: $actId}) {
      id
      type
      activity {
        id
        name
        }
      writer {
        id
        username
      }
      parentPost {
        id
        writer {
          id
          username
        }
      }
      interactions {
        id
        type
        actor {
          id
          username
        }
      }
    }
  }
  `;


// Testing display of query results
export default function LoadDataAndGraph() {

  const client = useApolloClient();

  const { loading, error, data } = useQuery(getPostsQuery,
    {variables: {"actId": ACT_ID},});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message} </p>;
  if (!data) return <p>No data</p>;


  Object.keys(client.cache.data.data).forEach(key => {
    key.match(/^Member/) && (client.cache.data.data[key].test = "hey!");
    
  }
  );


  console.log('cache ==>', client.cache.data.data);
  console.log('data ==>', data);
  // test.forEach((post) => {post.content = post.content[0]});
  // let res = []
  // for (let activity of test) {
  //   res.push({});
  //   for (let field of Object.keys(activity)) {
  //     if (activity[field]) res[res.length-1][field] = activity[field];
  //   }
  // }

//   for (let activity of test) {
//     for (let field in activity) {
//       if (activity[field] != null) {
//         // console.log(activity[field]);
//         res[activity.name][field] = activity[field];
//     }
//   }
// }
  // test.forEach((activity) => Object.keys(activity).forEach((i) => ((activity[i] != null) && delete(activity[i]))));
  // test.forEach((activity) => {Object.keys(activity).forEach((field) => {console.log(field)}console.log(activity);});
  // test.forEach(elem => {Object.keys(elem).forEach((key) => (elem[key] == null) && delete elem[key])});
  // console.log('test ==>', test);
  // console.log('res ==>', res);

  return (
    <div>
      <h3>Posts:</h3>
      {data.posts.map((post) => (
        <div>
        Name: {post.writer.username} / Type: {post.type} / Parent: {!!post.parentPost && post.parentPost.writer.username}
        </div>
      )
      )}
      {/* <h3>Interactions:</h3>
      {data.posts.map((post) => (
        <div>
        Actor: {post.writer.username} / Type: {post.type} / Parent: {!!post.parentPost && post.parentPost.writer.username}
        </div>
      )
      )} */}
      <Graph data={data}/>
    </div>
  );
}