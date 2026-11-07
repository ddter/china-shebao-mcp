#!/usr/bin/env node
// China Shebao & Payroll Tax MCP stdio-to-Streamable-HTTP bridge (zero dependencies, Node >= 18)
// Remote endpoint: https://www.shebao.org/mcp
import readline from 'node:readline';

const ENDPOINT = process.env.SHEBAO_MCP_URL || 'https://www.shebao.org/mcp';
const PROTOCOL_VERSION = '2025-06-18';

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
  terminal: false,
});

let queue = Promise.resolve();

async function forwardLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let parsed = null;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    process.stdout.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error: invalid JSON on stdin' },
      }) + '\n',
    );
    return;
  }

  const reqId =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'id' in parsed
      ? parsed.id
      : null;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'MCP-Protocol-Version': PROTOCOL_VERSION,
        'User-Agent': 'china-shebao-mcp-stdio/1.0.1',
      },
      body: trimmed,
      signal: AbortSignal.timeout(15000),
    });

    if (res.status === 202 || res.status === 204) {
      return;
    }

    const text = (await res.text()).trim();
    if (!text) return;

    // Ensure single-line JSON output per MCP stdio framing rules
    try {
      const json = JSON.parse(text);
      process.stdout.write(JSON.stringify(json) + '\n');
    } catch {
      process.stdout.write(text.replace(/\r?\n/g, ' ') + '\n');
    }
  } catch (err) {
    if (reqId !== null && reqId !== undefined) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: reqId,
          error: {
            code: -32000,
            message: `Upstream connection error (${ENDPOINT}): ${err instanceof Error ? err.message : String(err)}`,
          },
        }) + '\n',
      );
    }
  }
}

rl.on('line', (line) => {
  queue = queue.then(() => forwardLine(line));
});

rl.on('close', () => {
  queue.finally(() => process.exit(0));
});
