
import { getPineconeApiKey, getPineconeApiUrl, isPineconeConfigured } from './config';
import { createEmbedding, createEmbeddings } from './embedding';

/**
 * Upserts a document into the Pinecone index
 */
export const upsertToPinecone = async (
  id: string,
  embedding: number[],
  metadata: Record<string, any>,
  namespace: string = ''
): Promise<boolean> => {
  if (!isPineconeConfigured()) {
    throw new Error("Pinecone is not configured");
  }

  try {
    const response = await fetch(getPineconeApiUrl('vectors/upsert'), {
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
        }],
        namespace
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
 * Batch upsert multiple vectors to Pinecone
 */
export const batchUpsertToPinecone = async (
  vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, any>;
  }>,
  namespace: string = ''
): Promise<boolean> => {
  if (!isPineconeConfigured()) {
    throw new Error("Pinecone is not configured");
  }

  try {
    const response = await fetch(getPineconeApiUrl('vectors/upsert'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': getPineconeApiKey()
      },
      body: JSON.stringify({
        vectors,
        namespace
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone API error: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error("Error batch upserting to Pinecone:", error);
    throw new Error(`Failed to batch upsert to Pinecone: ${(error as Error).message}`);
  }
};

/**
 * Searches the Pinecone index for similar vectors
 */
export const queryPinecone = async (
  embedding: number[],
  topK: number = 5,
  filter: Record<string, any> = {},
  namespace: string = '',
  includeValues: boolean = false
): Promise<Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
  values?: number[];
}>> => {
  if (!isPineconeConfigured()) {
    throw new Error("Pinecone is not configured");
  }

  try {
    const response = await fetch(getPineconeApiUrl('query'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': getPineconeApiKey()
      },
      body: JSON.stringify({
        vector: embedding,
        topK,
        includeMetadata: true,
        includeValues,
        filter,
        namespace
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
  metadata: Record<string, any> = {},
  namespace: string = ''
): Promise<string> => {
  try {
    const id = `doc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const embedding = await createEmbedding(text, 'passage');
    await upsertToPinecone(id, embedding, {
      ...metadata,
      text: text.slice(0, 1000) // Store a preview of the text
    }, namespace);
    return id;
  } catch (error) {
    console.error("Error indexing document:", error);
    throw new Error(`Failed to index document: ${(error as Error).message}`);
  }
};

/**
 * Batch index multiple documents into Pinecone with generated embeddings
 */
export const batchIndexDocuments = async (
  documents: Array<{id: string, text: string, metadata?: Record<string, any>}>,
  namespace: string = ''
): Promise<string[]> => {
  try {
    // Generate embeddings for all texts at once
    const texts = documents.map(doc => doc.text);
    const embeddings = await createEmbeddings(texts, 'passage');
    
    // Prepare vectors for batch upsert
    const vectors = documents.map((doc, index) => ({
      id: doc.id,
      values: embeddings[index],
      metadata: {
        ...doc.metadata || {},
        text: doc.text.slice(0, 1000) // Store a preview of the text
      }
    }));
    
    // Batch upsert to Pinecone
    await batchUpsertToPinecone(vectors, namespace);
    
    return documents.map(doc => doc.id);
  } catch (error) {
    console.error("Error batch indexing documents:", error);
    throw new Error(`Failed to batch index documents: ${(error as Error).message}`);
  }
};

/**
 * Retrieves similar documents from Pinecone based on a query
 */
export const retrieveSimilarDocuments = async (
  query: string,
  topK: number = 5,
  filter: Record<string, any> = {},
  namespace: string = ''
): Promise<Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>> => {
  try {
    const queryEmbedding = await createEmbedding(query, 'query');
    return await queryPinecone(queryEmbedding, topK, filter, namespace);
  } catch (error) {
    console.error("Error retrieving similar documents:", error);
    throw new Error(`Failed to retrieve similar documents: ${(error as Error).message}`);
  }
};

/**
 * Create a utility function to implement the example from the Python code
 */
export const examplePineconeSimilaritySearch = async (
  documents: Array<{id: string, text: string}>,
  query: string,
  namespace: string = 'ns1'
): Promise<any> => {
  try {
    // Step 1: Batch index the documents
    await batchIndexDocuments(documents, namespace);
    
    // Step 2: Create query embedding and search
    const results = await retrieveSimilarDocuments(query, 3, {}, namespace);
    
    return {
      query,
      matches: results
    };
  } catch (error) {
    console.error("Error in similarity search example:", error);
    throw new Error(`Failed to perform similarity search: ${(error as Error).message}`);
  }
};
