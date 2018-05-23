import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const ArticlesItemType = new ObjectType({
  name: 'ArticlesItem',
  fields: {
    title: { type: new NonNull(StringType) },
    link: { type: new NonNull(StringType) },
    author: { type: StringType },
    pubDate: { type: new NonNull(StringType) },
    content: { type: StringType },
  },
});

export default ArticlesItemType;