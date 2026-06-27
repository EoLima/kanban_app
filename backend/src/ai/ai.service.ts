import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash:free';

interface OpenRouterResponse {
  choices: { message: { content: string } }[];
  error?: { message: string };
}

interface ChatMessage {
  role: string;
  content: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async testConnection(): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new HttpException('OPENROUTER_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Kanban Studio',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: '2+2=' }],
          max_tokens: 10,
        }),
        signal: controller.signal,
      });

      const data: OpenRouterResponse = await res.json();
      if (data.error) {
        throw new HttpException(`OpenRouter error: ${data.error.message}`, HttpStatus.BAD_GATEWAY);
      }
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new HttpException('Empty response from OpenRouter', HttpStatus.BAD_GATEWAY);
      return content;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new HttpException('OpenRouter request timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      this.logger.error('OpenRouter test failed', (err as Error).message);
      throw new HttpException(`OpenRouter request failed: ${(err as Error).message}`, HttpStatus.BAD_GATEWAY);
    } finally {
      clearTimeout(timeout);
    }
  }

  async chat(boardJson: object, message: string, history: ChatMessage[] = []) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new HttpException('OPENROUTER_API_KEY not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const systemPrompt = this.buildSystemPrompt(boardJson);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Kanban Studio',
        },
        body: JSON.stringify({ model: MODEL, messages, max_tokens: 2000 }),
        signal: controller.signal,
      });

      const data: OpenRouterResponse = await res.json();
      if (data.error) {
        throw new HttpException(`OpenRouter error: ${data.error.message}`, HttpStatus.BAD_GATEWAY);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new HttpException('Empty response from OpenRouter', HttpStatus.BAD_GATEWAY);

      return this.parseResponse(content);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new HttpException('OpenRouter request timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      this.logger.error('OpenRouter chat failed', (err as Error).message);
      throw new HttpException(`OpenRouter chat failed: ${(err as Error).message}`, HttpStatus.BAD_GATEWAY);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildSystemPrompt(boardJson: object): string {
    return `You are a Kanban board assistant. The current board state is:

${JSON.stringify(boardJson, null, 2)}

You can perform actions on cards. Always respond with valid JSON in this exact format:

{
  "reply": "your friendly text response to the user",
  "updates": [
    {
      "action": "CREATE",
      "title": "card title",
      "details": "optional details",
      "columnId": "column-id-from-board"
    }
  ]
}

Actions: CREATE, EDIT, MOVE, DELETE.

- CREATE: requires "title", "columnId" (use the id from the board JSON)
- EDIT: requires "cardId" (use the id from the board JSON) and optionally "title" and/or "details"
- MOVE: requires "cardId" and "columnId"
- DELETE: requires "cardId"

"updates" can be an empty array if no board changes are needed.
Return ONLY the JSON object, no markdown or extra text.`;
  }

  private parseResponse(content: string): { reply: string; updates: any[] } {
    const cleaned = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/gm, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        reply: parsed.reply || '',
        updates: Array.isArray(parsed.updates) ? parsed.updates : [],
      };
    } catch {
      return { reply: content, updates: [] };
    }
  }
}
