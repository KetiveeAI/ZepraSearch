import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({ node: process.env.ELASTIC_URL || 'http://localhost:9200' });

export interface PageDoc {
  url: string;
  title: string;
  content: string;
  crawledAt: string;
  metadata?: any;
}

export async function indexPage(page: PageDoc) {
  await esClient.index({
    index: 'pages',
    id: page.url,
    document: {
      ...page,
      metadata: page.metadata || {},
    }
  });
}

export async function searchPages(query: string, size = 10): Promise<PageDoc[]> {
  const { hits } = await esClient.search({
    index: 'pages',
    size,
    query: {
      multi_match: {
        query,
        fields: ['title', 'content']
      }
    }
  });
  return hits.hits.map((hit: any) => hit._source as PageDoc);
}
