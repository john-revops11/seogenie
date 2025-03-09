
import { getPineconeHostUrl, getPineconeApiKey, isPineconeConfigured } from './pineconeConfig';
import { createEmbedding } from './embeddingService';

/**
 * Upserts a document into the Pinecone index
 */
export const upsertToPinecone = async (
  id: string,
  embedding: number[],
  metadata: Record<string, any>
): Promise<boolean> => {
  if (!isPineconeConfigured()) {
    throw new Error("Pinecone is not configured");
  }

  try {
    const response = await fetch(`${getPineconeHostUrl()}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': getPineconeApiKey()
      },
      body: JSON.stringify({
        vectors: [{
          id,
          values: embedding,
          metadata
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone API error: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error("Error upserting to Pinecone:", error);
    throw new Error(`Failed to upsert to Pinecone: ${(error as Error).message}`);
  }
};

/**
 * Searches the Pinecone index for similar vectors
 */
export const queryPinecone = async (
  embedding: number[],
  topK: number = 5,
  filter: Record<string, any> = {}
): Promise<Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>> => {
  if (!isPineconeConfigured()) {
    throw new Error("Pinecone is not configured");
  }

  try {
    const response = await fetch(`${getPineconeHostUrl()}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': getPineconeApiKey()
      },
      body: JSON.stringify({
        vector: embedding,
        topK,
        includeMetadata: true,
        filter
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    throw new Error(`Failed to query Pinecone: ${(error as Error).message}`);
  }
};

/**
 * Indexes a document into Pinecone with generated embedding
 */
export const indexDocument = async (
  text: string, 
  metadata: Record<string, any> = {}
): Promise<string> => {
  try {
    const id = `doc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const embedding = await createEmbedding(text);
    await upsertToPinecone(id, embedding, {
      ...metadata,
      text: text.slice(0, 1000) // Store a preview of the text
    });
    return id;
  } catch (error) {
    console.error("Error indexing document:", error);
    throw new Error(`Failed to index document: ${(error as Error).message}`);
  }
};

/**
 * Retrieves similar documents from Pinecone based on a query
 */
export const retrieveSimilarDocuments = async (
  query: string,
  topK: number = 5,
  filter: Record<string, any> = {}
): Promise<Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>> => {
  try {
    const queryEmbedding = await createEmbedding(query);
    return await queryPinecone(queryEmbedding, topK, filter);
  } catch (error) {
    console.error("Error retrieving similar documents:", error);
    throw new Error(`Failed to retrieve similar documents: ${(error as Error).message}`);
  }
};
