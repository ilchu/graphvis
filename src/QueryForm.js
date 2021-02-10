import {useState, React} from 'react';
import {gql, useQuery} from '@apollo/client';

export default function QueryForm() {
  const [groupState, setGroupState] = useState('All groups');
  const [activityState, setActivityState] = useState('All activities');

  function handleSubmit(e) {
    e.preventDefault();
    console.log(groupState);
  }

  function handleChange(e) {
    setGroupState(e.target.value);
  }

  return(
    
    <form onSubmit={handleSubmit}>
      <label>Pick a query: 
        <select value={groupState} onChange={handleChange}>
          <option value="workspace">Workspace</option>
          <option value="activity">Activity</option>
          <option value="group">Group</option>
        </select>
        <input type="submit" value="Send query"/>
      </label>
    </form>
  );
}