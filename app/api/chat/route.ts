import { NextResponse } from "next/server";

// 9Router Chat Handler Endpoint

const systemPrompt = {
  role: "system",
  content: "You are Habuki, Rumi's portfolio AI assistant. Rumi (Haruka Kanemari) is a cybersecurity student and developer in Vietnam building Cloudcode (https://cloudcode.io.vn) hosting, Overlix side quest, and Security Lab Notes. He watch anime, specially cosmic princess kaguya! Answer in the same language as the user query."
};

async function executeSearch(query: string, apiKey: string, baseUrl: string) {
  try {
    const searchModel = process.env.NINEROUTER_SEARCH_MODEL || "exa";
    const endpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/search` : `${baseUrl}/v1/search`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: searchModel,
        query,
        max_results: 3
      })
    });

    if (!res.ok) return `Search failed: ${await res.text()}`;
    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return "No search results found.";

    return results.map((r: any) => `Source: ${r.title} (${r.url})\nContent: ${r.content}`).join("\n\n");
  } catch (err: any) {
    return `Search error: ${err.message}`;
  }
}

async function executeWebFetch(url: string, apiKey: string, baseUrl: string) {
  try {
    const fetchModel = "exa";
    const endpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/web/fetch` : `${baseUrl}/v1/web/fetch`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: fetchModel,
        url: url,
        format: "markdown",
        max_characters: 5000
      })
    });

    if (!res.ok) return `Fetch failed: ${await res.text()}`;
    const data = await res.json();
    return `Title: ${data.title || "No Title"}\nContent:\n${data.content || "No Content"}`;
  } catch (err: any) {
    return `Fetch error: ${err.message}`;
  }
}

async function executeImageGeneration(prompt: string, apiKey: string, baseUrl: string) {
  try {
    const imageModel = "cf/@cf/black-forest-labs/flux-2-klein-9b"
    const endpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/images/generations` : `${baseUrl}/v1/images/generations`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: imageModel,
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!res.ok) return `Image generation failed: ${await res.text()}`;
    const data = await res.json();
    const url = data.data?.[0]?.url;
    if (!url) return "No image URL returned.";
    return `Successfully generated image. URL: ${url}\nAlways display it using markdown syntax: ![Generated Image](${url})`;
  } catch (err: any) {
    return `Image generation error: ${err.message}`;
  }
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const ninerouterUrl = "https://mproxy.harumi.io.vn";
    const apiKey = process.env.OPENAI_API_KEY;
    const model = "chat";

    if (!apiKey) {
      return NextResponse.json({ error: "Ninerouter or OpenAI API key not configured" }, { status: 500 });
    }

    const finalMessages = [
      systemPrompt,
      ...messages.filter((m: any) => m.role !== "system")
    ];

    const cleanBaseUrl = ninerouterUrl.endsWith("/") ? ninerouterUrl.slice(0, -1) : ninerouterUrl;
    const endpoint = cleanBaseUrl.endsWith("/v1")
      ? `${cleanBaseUrl}/chat/completions`
      : `${cleanBaseUrl}/v1/chat/completions`;

    const tools = [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for real-time information, weather, or news.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query."
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "web_fetch",
          description: "Fetch the text/markdown content of a given URL link.",
          parameters: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "The complete web link URL to fetch."
              }
            },
            required: ["url"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_image",
          description: "Create an image from a detailed text description.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "The text description of the image to generate."
              }
            },
            required: ["prompt"]
          }
        }
      }
    ];

    // Request with stream: true to support models/proxies that enforce streaming responses
    const firstResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: finalMessages,
        tools: tools,
        tool_choice: "auto",
        stream: true
      })
    });

    if (!firstResponse.ok) {
      // Fallback: If 9router/model rejects the tools parameter (e.g. 400 Bad Request), try without tools
      const fallbackResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: finalMessages,
          stream: true
        })
      });

      if (!fallbackResponse.ok) {
        const errText = await fallbackResponse.text();
        return NextResponse.json({ error: `9router error: ${errText}` }, { status: fallbackResponse.status });
      }

      return new Response(fallbackResponse.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }

    // Buffer the stream response to safely check for streamed tool calls
    const reader = firstResponse.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let accumulatedContent = "";
    const toolCallsBuffer: any[] = [];

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.substring(6);
            if (dataStr === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              const choice = parsed.choices?.[0];
              const delta = choice?.delta;

              if (delta?.content) {
                accumulatedContent += delta.content;
              }

              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index;
                  if (!toolCallsBuffer[idx]) {
                    toolCallsBuffer[idx] = {
                      id: tc.id || "",
                      type: tc.type || "function",
                      function: {
                        name: tc.function?.name || "",
                        arguments: tc.function?.arguments || ""
                      }
                    };
                  } else {
                    if (tc.id) toolCallsBuffer[idx].id = tc.id;
                    if (tc.function?.name) toolCallsBuffer[idx].function.name += tc.function.name;
                    if (tc.function?.arguments) toolCallsBuffer[idx].function.arguments += tc.function.arguments;
                  }
                }
              }
            } catch {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }
    }

    const toolCalls = toolCallsBuffer.filter(Boolean);

    if (toolCalls && toolCalls.length > 0) {
      const finalMessagesWithTool = [
        ...finalMessages,
        {
          role: "assistant",
          content: accumulatedContent || null,
          tool_calls: toolCalls
        }
      ];

      for (const toolCall of toolCalls) {
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || "{}");
        let result = "";

        if (name === "web_search") {
          result = await executeSearch(args.query, apiKey, cleanBaseUrl);
        } else if (name === "web_fetch") {
          result = await executeWebFetch(args.url, apiKey, cleanBaseUrl);
        } else if (name === "generate_image") {
          result = await executeImageGeneration(args.prompt, apiKey, cleanBaseUrl);
        }

        finalMessagesWithTool.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: name,
          content: result
        });
      }

      const streamResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: finalMessagesWithTool,
          stream: true
        })
      });

      if (!streamResponse.ok) {
        const errText = await streamResponse.text();
        return NextResponse.json({ error: `9router stream error: ${errText}` }, { status: streamResponse.status });
      }

      return new Response(streamResponse.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }

    // No tool calls detected. Return the buffered contents in SSE format
    const sseResponse = `data: ${JSON.stringify({
      choices: [{ delta: { content: accumulatedContent } }]
    })}\n\ndata: [DONE]\n\n`;

    return new Response(sseResponse, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (err: any) {
    console.error("Chat API Route Error:", err);
    return NextResponse.json({ error: "Server error", details: err?.message || String(err) }, { status: 500 });
  }
}
