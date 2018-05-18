var fetch = require('node-fetch');
const crypto = require('crypto');

const createContentDigest = obj => crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

const createChildren = (entries = [], parentId, createNode) => {
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

const sourceNodes = async ({boundActionCreators}, {sources = []}) => {
    const {createNode} = boundActionCreators;
    const sourcesData = await Promise.all(sources.map(async obj => await fetch(obj.url).then(resp => resp.json())));
    const flag = sourcesData.reduce((data, prev) => !!data && !!prev, true);

    if (!Array.isArray(sources)) return null;

    const childrenIds = sourcesData.map((data, i) => data ? createChildren(data.articles, sources[i].url, createNode) : []);
    const children = childrenIds.reduce((child, gen) => gen.concat(child), []);

    let feedStory = {
        id: generateUUID(),
        title: 'Headline News',
        description: 'Top Headline News Today',
        link: '/',
        parent: null,
        children
    }

    feedStory.internal = {
        type: 'NewsFeed',
        contentDigest: createContentDigest(feedStory)
    }

    createNode(feedStory);
    return;
}

exports.sourceNodes = sourceNodes;
