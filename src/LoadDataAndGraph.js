import React from 'react';
import { gql, useQuery} from "@apollo/client";
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
  interaction: gql`
  fragment interactionFields on Interaction {
    id
    type
    actor {
      id
      username}
  }
  `,
  activity: gql`
  fragment activityFields on Activity {
    id
    name
    interactions {
      id
      type
      actor {
        id
        username
      }
    }
  }
  `,
};

// sample IDs for dev
const GROUP_ID = "5fe17e24563de738c3a21661";
const ACT_ID = "5fe3e6f8563de738c3a21774";

const getActivitiesQuery = gql`
  query getActivities($groupId: ID!, $actId: ID!) {
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

const GET_POSTS_AND_INTERACTIONS = gql`
  query getPosts($actId: ID!) {
    posts(where: {activity: $actId}) {
      id
      type
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
        ... interactionFields
      }
    }
  }
  ${LoadDataAndGraph.fragments.interaction}
`;  


const GET_ACTIVITY = gql`
  query getActivity($actId: ID!) {
    activity(id: $actId) {
        ... activityFields
        }
      }
      ${LoadDataAndGraph.fragments.activity}
    `;

const GET_MEMBER_INTERACTIONS_ACTIVITY = gql`
  query getMembIntActivity($actId: ID!) {
    memberInteractions(where: {activity: $actId}) {
      id
      actor {username id}
      receiver {username id}
      type
      quantity
        }
      }
    `;
// Testing display of query results
export default function LoadDataAndGraph() {

  const { loading, error, data } = useQuery(GET_POSTS_AND_INTERACTIONS, {
    variables: {"actId": ACT_ID},});



  const { loading:loadingActivity, error:errorActivity, data:activity } = useQuery(GET_ACTIVITY,
    {variables: {"actId": ACT_ID},});


  if (loading || loadingActivity) return <p>Loading posts and activity data...</p>;
  if (error || errorActivity) return <p>Error : {error.message} </p>;
  if (!data) return <p>No posts found</p>;

  console.log('data ==>', data);
  console.log('activity ==>', activity);

  return (
    <div>
      <h3>Posts:</h3>
      {data.posts.map((post) => (
        <div>
        Name: {post.writer.username} / Member ID: {post.writer.id} / Post ID: {post.id} / Parent: {!!post.parentPost && post.parentPost.writer.username}
        </div>
      )
      )}
      <h3>Interactions:</h3>
      {data.posts.map((post) => (post.interactions.map(interaction => (
        <div>
          Actor: {interaction.actor.username} / Post ID: {post.id}
        </div>
      )
      )
      )
      )}
      <Graph posts={data} activity={activity}/>
    </div>
  );
}