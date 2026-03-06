import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// در dev مستقیم به بک‌اند وصل می‌شویم تا از مشکل پروکسی Vite جلوگیری شود
const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ||
  (import.meta.env.DEV ? "http://localhost:2345/graphql" : "/graphql");

const httpLink = createHttpLink({
  uri: graphqlUri,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("auth_token");
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          festivals: { merge: (_existing, incoming) => incoming },
          myImages: { merge: (_existing, incoming) => incoming },
          myNotifications: { merge: (_existing, incoming) => incoming },
          festivalImages: { merge: (_existing, incoming) => incoming },
          imageComments: { merge: (_existing, incoming) => incoming },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
