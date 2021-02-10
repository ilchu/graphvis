// import logo from './logo.svg';
import React from 'react';
import './App.css';

import { ApolloProvider } from "@apollo/client";
import { client } from "./client";

import LoadDataAndGraph from "./LoadDataAndGraph";
import QueryForm from "./QueryForm";

function App() {

  return(
    <ApolloProvider client={client}>
      <QueryForm/>
      <LoadDataAndGraph />
    </ApolloProvider>
  );
}

export default App;
