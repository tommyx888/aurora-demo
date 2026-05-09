/**
 * Diagnostic helper for AI debugging
 * Lets user verify what's happening with the API
 */

import Anthropic from '@anthropic-ai/sdk';

interface DiagnosticResult {
  timestamp: string;
  checks: {
    name: string;
    pass: boolean;
    detail: string;
  }[];
  apiTest?: {
    success: boolean;
    response?: string;
    error?: string;
    errorStatus?: number;
  };
}

export async function runAIDiagnostics(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    checks: [],
  };

  // Check 1: env variable present
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  result.checks.push({
    name: 'VITE_ANTHROPIC_API_KEY in .env.local',
    pass: !!apiKey,
    detail: apiKey ? `Found (length: ${apiKey.length}, prefix: ${apiKey.slice(0, 12)}...)` : 'NOT FOUND',
  });

  if (!apiKey) {
    result.checks.push({
      name: 'API key format',
      pass: false,
      detail: 'Cannot check — key missing',
    });
    return result;
  }

  // Check 2: API key format
  const validFormat = apiKey.startsWith('sk-ant-') && apiKey.length > 50;
  result.checks.push({
    name: 'API key format',
    pass: validFormat,
    detail: validFormat ? 'Valid format (starts with sk-ant-)' : 'Invalid format (should start with sk-ant-)',
  });

  // Check 3: SDK loaded
  let sdkLoaded = false;
  try {
    sdkLoaded = !!Anthropic;
  } catch (e) {
    sdkLoaded = false;
  }
  result.checks.push({
    name: '@anthropic-ai/sdk loaded',
    pass: sdkLoaded,
    detail: sdkLoaded ? 'OK' : 'SDK not loaded — run npm install',
  });

  if (!sdkLoaded) return result;

  // Check 4: Client init
  let client: Anthropic | null = null;
  try {
    client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    result.checks.push({
      name: 'Anthropic client initialization',
      pass: true,
      detail: 'Client created OK',
    });
  } catch (e: any) {
    result.checks.push({
      name: 'Anthropic client initialization',
      pass: false,
      detail: `Failed: ${e?.message || 'unknown'}`,
    });
    return result;
  }

  // Check 5: actual API call
  if (client) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Povedz "ahoj" v slovencine.' }],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock && 'text' in textBlock ? textBlock.text : '(no text)';

      result.apiTest = {
        success: true,
        response: text,
      };
      result.checks.push({
        name: 'Live API call (test message)',
        pass: true,
        detail: `OK · response: "${text.slice(0, 100)}"`,
      });
    } catch (e: any) {
      result.apiTest = {
        success: false,
        error: e?.message || 'unknown error',
        errorStatus: e?.status,
      };
      result.checks.push({
        name: 'Live API call (test message)',
        pass: false,
        detail: `FAILED · status ${e?.status || '?'} · ${e?.message || 'unknown'}`,
      });
    }
  }

  return result;
}
