// import logo from './logo.svg';
import React from 'react';
import './App.css';

import { ApolloProvider } from "@apollo/client";
import { client } from "./client";

import LoadDataAndGraph from "./LoadDataAndGraph";
import QueryForm from "./QueryForm";
import SplitPane from "./SplitPane";

function App() {

  return(
    <ApolloProvider client={client}>
      <SplitPane
      left={
        <QueryForm/>
      }
      right={
        <LoadDataAndGraph/>
      }
      />
    </ApolloProvider>
  );
}

export default App;
