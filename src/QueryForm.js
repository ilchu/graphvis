import {useState} from 'react';

export default function QueryForm() {
  const [option, setOption] = useState('group');

  function handleSubmit(e) {
    e.preventDefault();
    console.log(option);
  }

  function handleChange(e) {
    setOption(e.target.value);
  }

  return(
    <form onSubmit={handleSubmit}>
      <label>Pick a query: 
        <select value={option} onChange={handleChange}>
          <option value="activity">Activity</option>
          <option value="group">Group</option>
          <option value="workspace">Workspace</option>
        </select>
        <input type="submit" value="Send query"/>
      </label>
    </form>
  );
}