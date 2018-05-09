var fetch = require('node-fetch');
const crypto = require('crypto');

const createContentDigest = obj => crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');

const createChildren = (entries, parentId, createNode) => {
    const childIds = [];
    entries.forEach(entry => {
      childIds.push(entry.url);

      const node = Object.assign({}, entry, {
        id: entry.url,
        title: entry.title,
        link: entry.url,
        description: entry.description,
        parent: parentId,
        children: []
      });

      node.internal = {
        type: 'NewsFeedItem',
        contentDigest: createContentDigest(node)
      };

      createNode(node);
    });
    return childIds;
  };

const sourceNodes = async ({boundActionCreators}) => {
    const {createNode} = boundActionCreators;
    
    //const url = 'https://api.newsapi.aylien.com/api/v1/stories?text=viet&published_at.start=NOW-29DAYS%2FDAY&published_at.end=NOW&categories.id%5B%5D=IAB20&categories.taxonomy=iab-qag&language=en&sort_by=recency'
    
    const url = 'https://newsapi.org/v2/top-headlines'
            + '?apiKey=ca8f478ba3af4300ab29be359e0efc2f'
            + '&country=us'
            + '&pageSize=30';
    
    const url2 = 'https://newsapi.org/v2/everything?q=south%20china%20sea&sortBy=publishedAt&apiKey=ca8f478ba3af4300ab29be359e0efc2f&pageSize=10'

    const url3 = 'https://newsapi.org/v2/everything?q=vietnam&sortBy=publishedAt&apiKey=ca8f478ba3af4300ab29be359e0efc2f&language=en&pageSize=30'

    // const url = 'https://newsapi.org/v2/everything'
    //         + '?q=bitcoin'
    //         + '&apiKey=ca8f478ba3af4300ab29be359e0efc2f';
    
    // const url = 'https://newsapi.org/v2/top-headlines'
    // + '?apiKey=ca8f478ba3af4300ab29be359e0efc2f'
    // + '&country=cn';
           
    const data = await fetch(url).then(response => response.json());
    const data2 = await fetch(url2).then(response => response.json());
    const data3 = await fetch(url3).then(response => response.json());

    if (!data && !data2 && !data3) {
        return;
    }

    console.log('>>> DATA3', data3);

    const childrenIds = data ? createChildren(data.articles, url, createNode) : [];
    const childrenIds2 = data2 ? createChildren(data2.articles, url2, createNode) : [];
    const childrenIds3 = data3 ? createChildren(data3.articles, url3, createNode) : [];

    let feedStory = {
        id: url,
        title: 'Headline News, US',
        description: 'Top Headline News Today',
        link: url,
        parent: null,
        children: childrenIds.concat(childrenIds2).concat(childrenIds3)
    }

    feedStory.internal = {
        type: 'NewsFeed',
        contentDigest: createContentDigest(feedStory)
    }

    createNode(feedStory);
    return;
}

exports.sourceNodes = sourceNodes;