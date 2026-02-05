

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://navitronix.hasura.app/v1/graphql', // Replace with your endpoint
    headers: {
      // Add your admin secret or JWT as needed
      'x-hasura-admin-secret': '6Jq3rrhRADpfTtekef8mvs7obb2nzMbE59fo5DdN8NEMyPVUaekU7igt1qLNb1fG',
    },
  }),
  cache: new InMemoryCache(),
});

export default client;