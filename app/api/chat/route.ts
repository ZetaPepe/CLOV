import { NextResponse } from "next/server"

const systemMessage = {
  role: "system" as const,
  content: `You are CLOV AI, a helpful and knowledgeable assistant. You can help with a wide variety of topics including:

- General questions and information
- Current events and world knowledge
- Technical topics and explanations
- Creative tasks and brainstorming
- Problem-solving and analysis
- Web content analysis and summarization
- And much more!

While you have expertise in crypto and influencer markets, you're not limited to those topics. Feel free to assist with any questions or tasks the user has. Be helpful, informative, and engaging in your responses.

When analyzing web content, provide clear insights and summaries based on the scraped content.`,
}

const followerTierTemplates = {
  "under-100k": `Market Capitalization Valuation Result: 500K-1.5M USD 

Valuation Model：
def advanced_token_valuation(followers: int,
                             base_value_per_user: float = 1.5,
                             engagement_rate: float = 0.05,
                             market_sentiment: float = 1.0,
                             trust_score: float = 0.8,
                             simulations: int = 1000):
    Advanced valuation model for influencer-launched tokens.
    
    followers: number of followers
    base_value_per_user: USD baseline value of each follower
    engagement_rate: fraction of followers who may act (0-1)
    market_sentiment: market climate multiplier (>1 bullish, <1 bearish)
    trust_score: credibility factor (0-1)
    simulations: number of Monte Carlo runs
    valuations = []
    # logarithmic scaling for diminishing returns
    effective_audience = math.log1p(followers) * 10  
    
    for _ in range(simulations):
        # stochastic noise ~ N(0, 0.1)
        noise = random.gauss(0, 0.1)
        
        valuation = (effective_audience *
                     base_value_per_user *
                     engagement_rate *
                     market_sentiment *
                     trust_score *
                     (1 + noise))
        
        valuations.append(max(valuation, 0))  # no negative valuations
    
    return {
        "mean": sum(valuations) / len(valuations),
        "min": min(valuations),
        "max": max(valuations),
        "sample_size": simulations
    }

Market Capitalization Valuation Result: 500K-1.5M USD`,

  "100k-500k": `Market Capitalization Valuation Result: 1M-3M USD 

Valuation Model：
def advanced_token_valuation(followers: int,
                             base_value_per_user: float = 1.5,
                             engagement_rate: float = 0.05,
                             market_sentiment: float = 1.0,
                             trust_score: float = 0.8,
                             simulations: int = 1000):
    Advanced valuation model for influencer-launched tokens.
    
    followers: number of followers
    base_value_per_user: USD baseline value of each follower
    engagement_rate: fraction of followers who may act (0-1)
    market_sentiment: market climate multiplier (>1 bullish, <1 bearish)
    trust_score: credibility factor (0-1)
    simulations: number of Monte Carlo runs
    valuations = []
    # logarithmic scaling for diminishing returns
    effective_audience = math.log1p(followers) * 10  
    
    for _ in range(simulations):
        # stochastic noise ~ N(0, 0.1)
        noise = random.gauss(0, 0.1)
        
        valuation = (effective_audience *
                     base_value_per_user *
                     engagement_rate *
                     market_sentiment *
                     trust_score *
                     (1 + noise))
        
        valuations.append(max(valuation, 0))  # no negative valuations
    
    return {
        "mean": sum(valuations) / len(valuations),
        "min": min(valuations),
        "max": max(valuations),
        "sample_size": simulations
    }

Market Capitalization Valuation Result: 1M-3M USD`,

  "500k-1m": `Market Capitalization Valuation Result: 2M-5M USD 

Valuation Model：
def advanced_token_valuation(followers: int,
                             base_value_per_user: float = 1.5,
                             engagement_rate: float = 0.05,
                             market_sentiment: float = 1.0,
                             trust_score: float = 0.8,
                             simulations: int = 1000):
    Advanced valuation model for influencer-launched tokens.
    
    followers: number of followers
    base_value_per_user: USD baseline value of each follower
    engagement_rate: fraction of followers who may act (0-1)
    market_sentiment: market climate multiplier (>1 bullish, <1 bearish)
    trust_score: credibility factor (0-1)
    simulations: number of Monte Carlo runs
    valuations = []
    # logarithmic scaling for diminishing returns
    effective_audience = math.log1p(followers) * 10  
    
    for _ in range(simulations):
        # stochastic noise ~ N(0, 0.1)
        noise = random.gauss(0, 0.1)
        
        valuation = (effective_audience *
                     base_value_per_user *
                     engagement_rate *
                     market_sentiment *
                     trust_score *
                     (1 + noise))
        
        valuations.append(max(valuation, 0))  # no negative valuations
    
    return {
        "mean": sum(valuations) / len(valuations),
        "min": min(valuations),
        "max": max(valuations),
        "sample_size": simulations
    }

Market Capitalization Valuation Result: 2M-5M USD`,

  "1m-plus": `Market Capitalization Valuation Result: 4M-10M USD 

Valuation Model：
def advanced_token_valuation(followers: int,
                             base_value_per_user: float = 1.5,
                             engagement_rate: float = 0.05,
                             market_sentiment: float = 1.0,
                             trust_score: float = 0.8,
                             simulations: int = 1000):
    Advanced valuation model for influencer-launched tokens.
    
    followers: number of followers
    base_value_per_user: USD baseline value of each follower
    engagement_rate: fraction of followers who may act (0-1)
    market_sentiment: market climate multiplier (>1 bullish, <1 bearish)
    trust_score: credibility factor (0-1)
    simulations: number of Monte Carlo runs
    valuations = []
    # logarithmic scaling for diminishing returns
    effective_audience = math.log1p(followers) * 10  
    
    for _ in range(simulations):
        # stochastic noise ~ N(0, 0.1)
        noise = random.gauss(0, 0.1)
        
        valuation = (effective_audience *
                     base_value_per_user *
                     engagement_rate *
                     market_sentiment *
                     trust_score *
                     (1 + noise))
        
        valuations.append(max(valuation, 0))  # no negative valuations
    
    return {
        "mean": sum(valuations) / len(valuations),
        "min": min(valuations),
        "max": max(valuations),
        "sample_size": simulations
    }

Market Capitalization Valuation Result: 4M-10M USD`,
}

async function fetchWebContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()

    // Basic HTML parsing to extract text content
    // Remove script and style elements
    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    // Limit content length to avoid token limits
    return cleanHtml.substring(0, 3000)
  } catch (error) {
    console.error("Error fetching web content:", error)
    return `Error fetching content from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.isTemplateRequest && body.tier) {
      const template = followerTierTemplates[body.tier as keyof typeof followerTierTemplates]

      if (!template) {
        return NextResponse.json(
          {
            message: "Invalid tier selection. Please try again.",
            success: false,
          },
          { status: 400 },
        )
      }

      const lines = template.split("\n")

      return NextResponse.json({
        message: template,
        lines: lines, // Send lines array for line-by-line display
        success: true,
        isTemplate: true, // Flag to indicate this is a template response
      })
    }

    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    let processedMessages = [...messages]

    if (lastMessage && lastMessage.role === "user") {
      const urls = extractUrls(lastMessage.content)

      if (urls.length > 0) {
        console.log(`Found ${urls.length} URL(s) to scrape:`, urls)

        // Scrape content from all URLs
        const scrapedContents = await Promise.all(
          urls.map(async (url) => {
            const content = await fetchWebContent(url)
            return `\n\n--- Content from ${url} ---\n${content}\n--- End of content ---`
          }),
        )

        // Append scraped content to the user's message
        const enhancedMessage = {
          ...lastMessage,
          content: lastMessage.content + scrapedContents.join(""),
        }

        // Replace the last message with the enhanced version
        processedMessages = [...messages.slice(0, -1), enhancedMessage]
      }
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.error("OpenAI API key not found in environment variables")
      return NextResponse.json(
        {
          error: "OpenAI API key not configured. Please add your API key to environment variables.",
          success: false,
          errorType: "missing_key",
        },
        { status: 500 },
      )
    }

    // Validate API key format
    if (!openaiApiKey.startsWith("sk-") || openaiApiKey.length < 20) {
      console.error("Invalid OpenAI API key format")
      return NextResponse.json(
        {
          error: "Invalid OpenAI API key format. Please check your API key.",
          success: false,
          errorType: "invalid_format",
        },
        { status: 500 },
      )
    }

    console.log("Making request to OpenAI API...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [systemMessage, ...processedMessages],
        max_tokens: 800,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })

      if (response.status === 401) {
        // Check for specific error types
        const errorMessage = errorData?.error?.message || ""

        if (errorMessage.includes("account_deactivated") || errorMessage.includes("deactivated")) {
          return NextResponse.json(
            {
              error:
                "Your OpenAI account has been deactivated. Please check your email from OpenAI for more information, or create a new account at platform.openai.com",
              success: false,
              errorType: "account_deactivated",
            },
            { status: 401 },
          )
        } else if (errorMessage.includes("insufficient_quota") || errorMessage.includes("quota")) {
          return NextResponse.json(
            {
              error:
                "Your OpenAI account has exceeded its quota. Please add billing information or upgrade your plan at platform.openai.com/account/billing",
              success: false,
              errorType: "quota_exceeded",
            },
            { status: 401 },
          )
        } else {
          return NextResponse.json(
            {
              error:
                "Invalid OpenAI API key. Please check your API key at https://platform.openai.com/account/api-keys",
              success: false,
              errorType: "invalid_key",
            },
            { status: 401 },
          )
        }
      } else if (response.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again in a moment.",
            success: false,
            errorType: "rate_limit",
          },
          { status: 429 },
        )
      } else if (response.status === 403) {
        return NextResponse.json(
          {
            error: "Access denied. Please check your OpenAI account status and billing.",
            success: false,
            errorType: "access_denied",
          },
          { status: 403 },
        )
      } else {
        return NextResponse.json(
          {
            error: `OpenAI API error: ${response.status}. Please try again later.`,
            success: false,
            errorType: "api_error",
          },
          { status: 500 },
        )
      }
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure from OpenAI:", data)
      return NextResponse.json(
        {
          error: "Invalid response from AI service",
          success: false,
          errorType: "invalid_response",
        },
        { status: 500 },
      )
    }

    const assistantMessage = data.choices[0].message

    console.log("OpenAI API call successful")

    return NextResponse.json({
      message: assistantMessage,
      success: true,
      usage: data.usage, // Optional: track token usage
    })
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to process chat message. Please try again.",
        success: false,
        errorType: "network_error",
      },
      { status: 500 },
    )
  }
}
