
import { getApiKey } from '@/services/keywords/apiConfig';
import { toast } from 'sonner';

/**
 * Analyzes a document file using OpenAI's models and returns structured information
 */
export const analyzeDocument = async (file: File, fallbackModel: string = 'gpt-4o'): Promise<any> => {
  console.log(`Analyzing document: ${file.name} (${file.type})`);
  
  // Get OpenAI API key
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    console.error("OpenAI API key is not configured");
    toast.error("OpenAI API key is not configured. Please check your API settings.");
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    // Read the file
    const fileContent = await readFileAsBase64(file);
    
    // Determine file type
    let mimeType = file.type;
    if (!mimeType) {
      // Fallback for files without a type
      if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (file.name.endsWith('.csv')) mimeType = 'text/csv';
      else if (file.name.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (file.name.endsWith('.doc')) mimeType = 'application/msword';
      else if (file.name.endsWith('.txt')) mimeType = 'text/plain';
    }
    
    // Prepare the content for the model
    const content = [
      {
        type: "text",
        text: `Please analyze this ${getFileTypeDescription(file)} file named "${file.name}". Extract any important information, tables, and provide a brief summary.`
      },
      {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${fileContent}`
        }
      }
    ];
    
    // Use o1 for document analysis or fall back to another model
    const modelToUse = 'gpt-4o';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `You are an expert document analyst who extracts information from files and formats them for use in business contexts. 
            
            For spreadsheets and tables:
            1. Extract all table data in a structured format
            2. Identify key metrics and trends
            3. Explain the significance of the data
            
            For text documents:
            1. Extract main points and key information
            2. Identify any numerical data or statistics
            3. Summarize the content concisely
            
            For PDFs:
            1. Extract text content and structure
            2. Identify any tables, charts, or graphs
            3. Capture key figures and statistics
            
            Always structure your response in JSON format with the following structure:
            {
              "tables": [], // Array of extracted tables as arrays of objects
              "extractedText": "", // Plain text content extracted from the document
              "summary": "" // Brief summary of the document contents
            }`
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status}`, await response.text());
      throw new Error(`Document analysis failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    const resultText = data.choices[0].message.content.trim();
    
    // Try to parse the JSON response
    try {
      // Sometimes the API returns JSON with extra text, so we need to extract just the JSON part
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : resultText;
      
      const result = JSON.parse(jsonString);
      
      // Ensure the result has the expected structure
      return {
        tables: Array.isArray(result.tables) ? result.tables : [],
        extractedText: typeof result.extractedText === 'string' ? result.extractedText : '',
        summary: typeof result.summary === 'string' ? result.summary : ''
      };
    } catch (parseError) {
      console.error("Error parsing document analysis result:", parseError);
      
      // If JSON parsing fails, create a basic structure with the raw text
      return {
        tables: [],
        extractedText: resultText,
        summary: "Failed to parse structured data from document."
      };
    }
  } catch (error) {
    console.error("Document analysis error:", error);
    throw error;
  }
};

/**
 * Reads a file and returns its base64 encoded content
 */
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix if present
        const base64Content = reader.result.split(',')[1] || reader.result;
        resolve(base64Content);
      } else {
        reject(new Error('FileReader did not return a string'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Returns a human-readable description of the file type
 */
const getFileTypeDescription = (file: File): string => {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    return 'PDF';
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
    file.type === 'application/vnd.ms-excel' ||
    file.name.endsWith('.xlsx') || 
    file.name.endsWith('.xls')
  ) {
    return 'Excel spreadsheet';
  } else if (
    file.type === 'text/csv' ||
    file.name.endsWith('.csv')
  ) {
    return 'CSV';
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword' ||
    file.name.endsWith('.docx') ||
    file.name.endsWith('.doc')
  ) {
    return 'Word document';
  } else if (
    file.type === 'text/plain' ||
    file.name.endsWith('.txt')
  ) {
    return 'text';
  } else {
    return 'document';
  }
};
