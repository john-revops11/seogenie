
import { OPENAI_API_KEY } from '../keywords/apiConfig';

/**
 * Creates text embedding using OpenAI
 */
export const createEmbedding = async (text: string, inputType: 'passage' | 'query' = 'passage'): Promise<number[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw new Error(`Failed to create embedding: ${(error as Error).message}`);
  }
};

/**
 * Creates embeddings for multiple texts at once
 */
export const createEmbeddings = async (texts: string[], inputType: 'passage' | 'query' = 'passage'): Promise<number[][]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: texts,
        model: 'text-embedding-3-small',
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  } catch (error) {
    console.error("Error creating embeddings:", error);
    throw new Error(`Failed to create embeddings: ${(error as Error).message}`);
  }
};
