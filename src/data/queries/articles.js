import { 
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
} from 'graphql'
import ArticlesItemType from '../types/ArticlesItemType'

let items = [
  {
    title: 'article1',
    link: 'article1',
    author: 'xiao555',
    pubDate: new Date().toLocaleDateString(),
    content: 'This is a test atricle',
  },
  {
    title: 'article2',
    link: 'article2',
    author: 'xiao555',
    pubDate: new Date().toLocaleDateString(),
    content: 'This is also a test atricle',
  }
]

const articles = {
  type: new List(ArticlesItemType),
  args: {},
  resolve() {
    return items;
  },
};

const article = {
  type: ArticlesItemType,
  args: {
    id: {
      name: 'id',
      type: new NonNull(ID)
    }
  },
  resolve(root, params, options) {
    return items.find(post => post.link === params.id);
  },
};

export { articles, article };
