import typesenseClient from '@/lib/typesense/typesense-client';

export interface NLSearchModel {
  id: string;
  model_name: string;
  api_key?: string;
  system_prompt?: string;
  max_bytes?: number;
  temperature?: number;
  // Additional config for different providers
  api_base?: string; // For self-hosted models
  project_id?: string; // For GCP Vertex AI
  region?: string; // For GCP Vertex AI
  account_id?: string; // For Cloudflare Workers AI
  namespace_id?: string; // For Cloudflare Workers AI
  api_token?: string; // For Cloudflare Workers AI
  // Legacy fields for backward compatibility
  name?: string;
  model_type?: string;
  model_config?: {
    model_name: string;
    api_key?: string;
    system_prompt?: string;
    max_tokens?: number;
    temperature?: number;
    api_base?: string;
    project_id?: string;
    region?: string;
    account_id?: string;
    namespace_id?: string;
    api_token?: string;
  };
  collections?: string[];
  created_at?: number;
  updated_at?: number;
}

export interface CreateNLSearchModelRequest {
  name: string;
  model_type: string;
  model_config: {
    model_name: string;
    api_key?: string;
    system_prompt?: string;
    max_tokens?: number;
    temperature?: number;
    // Additional config for different providers
    api_base?: string;
    project_id?: string;
    region?: string;
    account_id?: string;
    namespace_id?: string;
    api_token?: string;
  };
  collections: string[];
}

export interface UpdateNLSearchModelRequest {
  name?: string;
  model_config?: {
    model_name?: string;
    api_key?: string;
    system_prompt?: string;
    max_tokens?: number;
    temperature?: number;
    api_base?: string;
    project_id?: string;
    region?: string;
    account_id?: string;
    namespace_id?: string;
    api_token?: string;
  };
  collections?: string[];
}

export interface NLSearchQuery {
  collection: string;
  nl_query: string;
  query_by?: string;
  filter_by?: string;
  sort_by?: string;
  per_page?: number;
  page?: number;
  facet_by?: string;
  max_facet_values?: number;
  nl_model_id?: string;
  debug?: boolean;
}

export interface NLSearchResponse {
  facet_counts?: any[];
  found: number;
  hits: Array<{
    document: any;
    highlight?: any;
    highlights?: any[];
    text_match?: number;
    text_match_info?: any;
  }>;
  out_of: number;
  page: number;
  request_params: any;
  search_cutoff?: boolean;
  search_time_ms: number;
  parsed_query?: {
    query: string;
    filter_by?: string;
    sort_by?: string;
    facet_by?: string;
  };
  parsed_nl_query?: {
    augmented_params?: any;
    error?: string;
    generated_params?: any;
  };
  raw_llm_response?: string;
}

// Create a new NL search model
export async function createNLSearchModel(model: CreateNLSearchModelRequest) {
  try {
    // Use the generic API call method since nlSearchModels may not be in types yet
    const response = await (typesenseClient as any).apiCall.post(
      '/nl_search_models',
      model,
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error creating NL search model:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// List all NL search models
export async function listNLSearchModels() {
  try {
    const response = await (typesenseClient as any).apiCall.get(
      '/nl_search_models',
    );
    // The API returns an array directly, not wrapped in a models property
    const models = Array.isArray(response) ? response : response.models || [];
    return {
      success: true,
      data: models,
    };
  } catch (error) {
    console.error('Error listing NL search models:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    };
  }
}

// Get a specific NL search model
export async function getNLSearchModel(modelId: string) {
  try {
    const response = await (typesenseClient as any).apiCall.get(
      `/nl_search_models/${modelId}`,
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error getting NL search model:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Update an NL search model
export async function updateNLSearchModel(
  modelId: string,
  updates: UpdateNLSearchModelRequest,
) {
  try {
    const response = await (typesenseClient as any).apiCall.put(
      `/nl_search_models/${modelId}`,
      updates,
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error updating NL search model:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Delete an NL search model
export async function deleteNLSearchModel(modelId: string) {
  try {
    await (typesenseClient as any).apiCall.delete(
      `/nl_search_models/${modelId}`,
    );
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting NL search model:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Perform natural language search
export async function naturalLanguageSearch(
  query: NLSearchQuery,
): Promise<{ success: boolean; data?: NLSearchResponse; error?: string }> {
  try {
    const searchParams: any = {
      q: query.nl_query,
      query_by: query.query_by || '*',
      per_page: query.per_page || 10,
      page: query.page || 1,
      nl_query: true,
    };

    if (query.filter_by) searchParams.filter_by = query.filter_by;
    if (query.sort_by) searchParams.sort_by = query.sort_by;
    if (query.facet_by) searchParams.facet_by = query.facet_by;
    if (query.max_facet_values)
      searchParams.max_facet_values = query.max_facet_values;
    if (query.nl_model_id) searchParams.nl_model_id = query.nl_model_id;
    if (query.debug) searchParams.debug = query.debug;

    console.log('NL Search params:', searchParams);

    const response = await typesenseClient
      .collections(query.collection)
      .documents()
      .search(searchParams);

    console.log('NL Search response:', response);

    return {
      success: true,
      data: response as NLSearchResponse,
    };
  } catch (error) {
    console.error('Error performing natural language search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get available model types and their configurations
export function getAvailableModelTypes() {
  return [
    {
      provider: 'OpenAI',
      models: [
        {
          id: 'openai/gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and cost-effective',
        },
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          description: 'More capable, higher quality',
        },
        {
          id: 'openai/gpt-4-turbo',
          name: 'GPT-4 Turbo',
          description: 'Latest GPT-4 with improved speed',
        },
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          description: 'Optimized GPT-4 variant',
        },
        {
          id: 'openai/gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Lightweight and fast GPT-4o',
        },
      ],
    },
    {
      provider: 'Anthropic',
      models: [
        {
          id: 'anthropic/claude-3-haiku',
          name: 'Claude 3 Haiku',
          description: 'Fast and efficient',
        },
        {
          id: 'anthropic/claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          description: 'Balanced performance',
        },
        {
          id: 'anthropic/claude-3-opus',
          name: 'Claude 3 Opus',
          description: 'Most capable Claude model',
        },
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          description: 'Enhanced Claude 3 Sonnet',
        },
      ],
    },
    {
      provider: 'Google Cloud',
      models: [
        {
          id: 'gcp/gemini-pro',
          name: 'Gemini Pro',
          description: "Google's advanced language model",
        },
        {
          id: 'gcp/gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Latest Gemini with extended context',
        },
        {
          id: 'gcp/gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Fast and efficient Gemini variant',
        },
      ],
    },
    {
      provider: 'Cloudflare Workers AI',
      models: [
        {
          id: 'cf/@cf/meta/llama-2-7b-chat-fp16',
          name: 'Llama 2 7B Chat',
          description: "Meta's Llama 2 optimized for chat",
        },
        {
          id: 'cf/@cf/meta/llama-2-7b-chat-int8',
          name: 'Llama 2 7B Chat (INT8)',
          description: 'Quantized version for faster inference',
        },
        {
          id: 'cf/@cf/mistral/mistral-7b-instruct-v0.1',
          name: 'Mistral 7B Instruct',
          description: "Mistral's instruction-tuned model",
        },
        {
          id: 'cf/@cf/microsoft/phi-2',
          name: 'Phi-2',
          description: "Microsoft's compact language model",
        },
      ],
    },
    {
      provider: 'vLLM (Self-hosted)',
      models: [
        {
          id: 'vllm/custom',
          name: 'Custom vLLM Model',
          description: 'Self-hosted model via vLLM',
        },
      ],
    },
  ];
}

// Default system prompts for different use cases
export function getDefaultSystemPrompts() {
  return {
    ecommerce: `You are a search assistant for an e-commerce platform. Parse user queries into structured search parameters.
Extract:
- search terms for the query field
- filters for categories, brands, price ranges, etc.
- sorting preferences (price, popularity, ratings, etc.)

Always respond with valid JSON containing query, filter_by, and sort_by fields.`,

    general: `You are a search assistant. Parse natural language queries into structured search parameters.
Extract the main search terms, any filters mentioned, and sorting preferences.
Respond with JSON containing query, filter_by, and sort_by fields.`,

    support: `You are a search assistant for a support knowledge base. Parse user questions into search parameters.
Focus on extracting the core issue, product categories, and urgency level.
Respond with JSON containing query, filter_by, and sort_by fields.`,

    content: `You are a search assistant for content discovery. Parse user queries for articles, documents, or media.
Extract topics, content types, dates, and relevance criteria.
Respond with JSON containing query, filter_by, and sort_by fields.`,
  };
}
