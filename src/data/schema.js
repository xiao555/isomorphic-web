import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import { articles, article } from './queries/articles';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      articles,
      article,
    },
  }),
});

export default schema;
