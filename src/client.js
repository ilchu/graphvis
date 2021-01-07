import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Apollo boilerplate
const httpLink = createHttpLink({
  uri: 'https://betastrapi.defora.io/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZTFiOGRiNTYzZGU3MzhjM2EyMTcxZiIsImlhdCI6MTYwODY4NTE5NSwiZXhwIjoxNjExMjc3MTk1fQ.FJ8GWr52A8m4PMCx-og_hGnIPVcydZSb5vPFvBFgOtk";
  // const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
})

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});