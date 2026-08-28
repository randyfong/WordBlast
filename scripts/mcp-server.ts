#!/usr/bin/env tsx
import http from 'node:http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { dualDB, TelemetryEvent } from '../src/lib/db/store.js';
import { pool } from '../src/lib/db/postgres.js';
import { PHONICS_CATALOG, STORY_THEMES, PhonicsWord } from '../src/lib/game/syllabication.js';

// Define MCP Tools
const TOOLS: Tool[] = [
  {
    name: 'get_phoneme_hesitation_matrix',
    description:
      'Fetches aggregated phoneme reading latency, hesitation ms, accuracy rate, and critical bottleneck severity from WordBlast ClickHouse analytics store. Highlights patterns causing reading stalls (e.g. silent-k, silent-w, digraphs).',
    inputSchema: {
      type: 'object',
      properties: {
        minSampleSize: {
          type: 'number',
          description: 'Optional minimum number of trials required to include a pattern in the analysis.',
        },
      },
    },
  },
  {
    name: 'get_recent_telemetry',
    description:
      'Retrieves recent student speech trial events with millisecond-accurate latency, hesitation timing, scaffold triggers, and word accuracy.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of recent telemetry events to retrieve (default: 20, max: 100).',
        },
        studentId: {
          type: 'string',
          description: 'Optional filter by student ID (e.g., "stu_4a_maya").',
        },
        pattern: {
          type: 'string',
          description: 'Optional filter by phonics pattern (e.g., "silent-k", "silent-w", "digraph-ph").',
        },
      },
    },
  },
  {
    name: 'generate_adaptive_remediation',
    description:
      'Generates a targeted phonics intervention package based on detected hesitation bottlenecks or a requested pattern. Returns decodable words, syllabic chunks, recommended game speed factor, and contextual hints.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Phonics pattern to target (e.g., "silent-k", "silent-w", "silent-g", "digraph-ph", "digraph-ch", "digraph-sh", "vowel-team-ea", "vowel-team-oa", "vowel-team-ai", "blends"). If omitted, the engine automatically selects the most critical bottleneck.',
        },
        wordCount: {
          type: 'number',
          description: 'Number of remediation words to include in the intervention wave (default: 4).',
        },
      },
    },
  },
  {
    name: 'query_phonics_catalog',
    description:
      'Searches WordBlast decodable word catalog with syllable breakdown, phoneme color codes, and story context clues.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Filter words by phonics pattern (e.g., "silent-k", "silent-w", "digraph-ph", "blends").',
        },
        themeId: {
          type: 'string',
          description: 'Filter words by story theme ("castle_quest", "ocean_mystery", "forest_enchanted", "space_voyage", "jurassic_safari", "cyber_city").',
        },
        search: {
          type: 'string',
          description: 'Substring match on word text or clue.',
        },
      },
    },
  },
  {
    name: 'get_high_scores',
    description:
      'Retrieves the WordBlast arcade leaderboard, high scores, streaks, and timestamps.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of top scores to return (default: 10).',
        },
      },
    },
  },
  {
    name: 'record_telemetry_event',
    description:
      'Records a student reading attempt into both the in-memory analytics store and PostgreSQL database table.',
    inputSchema: {
      type: 'object',
      required: ['word', 'phonicsPattern'],
      properties: {
        studentId: {
          type: 'string',
          description: 'Student ID identifier (default: "stu_agent_session").',
        },
        studentName: {
          type: 'string',
          description: 'Student or player display name.',
        },
        word: {
          type: 'string',
          description: 'The target word read by student (e.g., "KNIGHT").',
        },
        phonicsPattern: {
          type: 'string',
          description: 'Phonics category pattern (e.g., "silent-k", "silent-w", "blends").',
        },
        categoryLabel: {
          type: 'string',
          description: 'Human-readable category label (e.g., "Silent K (KN-)").',
        },
        latencyMs: {
          type: 'number',
          description: 'Total vocalization response latency in milliseconds.',
        },
        hesitationMs: {
          type: 'number',
          description: 'Initial silence/hesitation duration in milliseconds before first phoneme.',
        },
        accuracyScore: {
          type: 'number',
          description: 'Accuracy score from 0.0 to 1.0 (default: 1.0 for correct).',
        },
        scaffoldTriggered: {
          type: 'boolean',
          description: 'Whether visual syllabic scaffolding was triggered due to hesitation stall.',
        },
      },
    },
  },
  {
    name: 'query_db_attempts',
    description:
      'Queries raw attempts directly from the ClickHouse PostgreSQL database table (word_game_attempts).',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of rows to return (default: 20, max: 100).',
        },
        targetWord: {
          type: 'string',
          description: 'Filter by target word.',
        },
      },
    },
  },
];

// Helper to create and configure a Server instance
function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'wordblast-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'get_phoneme_hesitation_matrix': {
          const matrix = dualDB.getPhonemeHesitationMatrix();
          const minSampleSize = Number(args.minSampleSize) || 0;
          const filtered = minSampleSize > 0 ? matrix.filter((m) => m.sampleSize >= minSampleSize) : matrix;

          const criticalBottlenecks = filtered.filter((m) => m.severity === 'critical');
          const warningBottlenecks = filtered.filter((m) => m.severity === 'warning');

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    summary: {
                      totalPatternsAnalyzed: filtered.length,
                      criticalBottlenecks: criticalBottlenecks.map((b) => b.categoryLabel),
                      warningBottlenecks: warningBottlenecks.map((b) => b.categoryLabel),
                      insight:
                        criticalBottlenecks.length > 0
                          ? `CRITICAL STALL DETECTED on ${criticalBottlenecks.map((b) => b.categoryLabel).join(', ')}. Average response latency exceeds 1,000ms threshold. Immediate adaptive remediation recommended.`
                          : 'All phonics patterns are within acceptable fluency parameters.',
                    },
                    matrix: filtered,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case 'get_recent_telemetry': {
          const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
          let events = dualDB.getRecentTelemetry(100);

          if (args.studentId) {
            events = events.filter((e) => e.studentId === args.studentId);
          }
          if (args.pattern) {
            events = events.filter((e) => e.phonicsPattern === args.pattern);
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    count: events.slice(0, limit).length,
                    events: events.slice(0, limit),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case 'generate_adaptive_remediation': {
          const targetPattern = args.pattern as string | undefined;
          const wordCount = Math.min(Math.max(Number(args.wordCount) || 4, 1), 10);

          const metrics = dualDB.getPhonemeHesitationMatrix();
          const bottleneck = targetPattern
            ? metrics.find((m) => m.pattern === targetPattern)
            : metrics.find((m) => m.severity === 'critical') || metrics[0];

          const selectedPattern = bottleneck ? bottleneck.pattern : 'silent-k';

          let matchingWords: PhonicsWord[] = PHONICS_CATALOG.filter((w) => w.pattern === selectedPattern);
          if (matchingWords.length === 0) {
            matchingWords = PHONICS_CATALOG.slice(0, wordCount);
          } else {
            matchingWords = matchingWords.slice(0, wordCount);
          }

          const remediation = {
            targetPattern: selectedPattern,
            categoryLabel: bottleneck ? bottleneck.categoryLabel : 'Phonics Intervention',
            diagnosis: bottleneck
              ? `Student demonstrates ${bottleneck.avgLatencyMs}ms average response hesitation with ${bottleneck.accuracyRatePercent}% accuracy on ${bottleneck.categoryLabel}.`
              : 'Targeted fluency reinforcement wave.',
            interventionStrategy: {
              recommendedSpeedFactor: 0.8,
              scaffoldingRule: 'Display colored phonemic chunks if vocalization does not initiate within 1,200ms.',
              phonemicBreakdownTip: 'Emphasize the silent letter masking rule.',
            },
            remediationWords: matchingWords.map((w) => ({
              word: w.word,
              pattern: w.pattern,
              syllables: w.syllables,
              phoneticBreakdown: w.phoneticBreakdown,
              storyClue: w.storyClue,
              storySentence: w.storySentence,
            })),
            generatedAt: new Date().toISOString(),
          };

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(remediation, null, 2),
              },
            ],
          };
        }

        case 'query_phonics_catalog': {
          let words: PhonicsWord[] = [...PHONICS_CATALOG];

          if (args.themeId) {
            const theme = STORY_THEMES.find((t) => t.id === args.themeId);
            words = theme ? theme.words : [];
          }

          if (args.pattern) {
            words = words.filter((w) => w.pattern === args.pattern);
          }

          if (args.search) {
            const q = (args.search as string).toLowerCase();
            words = words.filter(
              (w) =>
                w.word.toLowerCase().includes(q) ||
                w.categoryLabel.toLowerCase().includes(q) ||
                w.storyClue.toLowerCase().includes(q)
            );
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    totalFound: words.length,
                    themesAvailable: STORY_THEMES.map((t) => ({ id: t.id, title: t.title, emoji: t.emoji })),
                    words,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case 'get_high_scores': {
          const limit = Number(args.limit) || 10;
          const scores = dualDB.getHighScores().slice(0, limit);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ leaderboard: scores }, null, 2),
              },
            ],
          };
        }

        case 'record_telemetry_event': {
          const {
            studentId = 'stu_agent_session',
            studentName = 'Agent Evaluator',
            word,
            phonicsPattern,
            categoryLabel,
            latencyMs = 850,
            hesitationMs = 700,
            accuracyScore = 1.0,
            scaffoldTriggered = false,
          } = args as any;

          if (!word || !phonicsPattern) {
            throw new Error('Missing required arguments: word and phonicsPattern');
          }

          const recorded = dualDB.insertTelemetry({
            studentId,
            studentName,
            word: word.toUpperCase(),
            phonicsPattern: phonicsPattern as any,
            categoryLabel: categoryLabel || phonicsPattern,
            latencyMs: Number(latencyMs),
            hesitationMs: Number(hesitationMs),
            accuracyScore: Number(accuracyScore),
            scaffoldTriggered: Boolean(scaffoldTriggered),
            timeGapToPhonemeMs: 45,
          });

          // Insert into Postgres if available
          let dbInserted = false;
          try {
            await pool.query(
              `
              INSERT INTO word_game_attempts (
                user_name, target_word, word_pattern, phonics_category,
                is_correct, pause_duration_seconds, clues_triggered, streak_count_at_attempt, score_earned
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
            `,
              [
                studentName,
                word.toUpperCase(),
                phonicsPattern,
                categoryLabel || phonicsPattern,
                accuracyScore >= 0.8,
                latencyMs / 1000,
                scaffoldTriggered ? 1 : 0,
                3,
                Math.round(accuracyScore * 500),
              ]
            );
            dbInserted = true;
          } catch (dbErr) {
            // Postgres insert error is non-fatal for MCP event logging
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Telemetry record created for word "${word}" (${phonicsPattern}).`,
                    event: recorded,
                    savedToPostgres: dbInserted,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case 'query_db_attempts': {
          const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
          const targetWord = args.targetWord as string | undefined;

          try {
            let query = `SELECT * FROM word_game_attempts`;
            const params: any[] = [];
            if (targetWord) {
              query += ` WHERE UPPER(target_word) = $1`;
              params.push(targetWord.toUpperCase());
            }
            query += ` ORDER BY attempted_at DESC LIMIT $${params.length + 1};`;
            params.push(limit);

            const res = await pool.query(query, params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ count: res.rows.length, rows: res.rows }, null, 2),
                },
              ],
            };
          } catch (err: any) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ error: 'Postgres query failed', details: err.message }, null, 2),
                },
              ],
            };
          }
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error executing tool "${name}": ${error.message || String(error)}`,
          },
        ],
      };
    }
  });

  return server;
}

// Main server startup
async function main() {
  const args = process.argv.slice(2);
  const isSSE = args.includes('--sse') || process.env.MCP_TRANSPORT === 'sse';
  const portArgIdx = args.indexOf('--port');
  const port = portArgIdx !== -1 ? parseInt(args[portArgIdx + 1], 10) : parseInt(process.env.MCP_PORT || '3005', 10);

  if (isSSE) {
    // SSE HTTP Transport for Remote LibreChat / Web Agents
    const activeTransports: Map<string, SSEServerTransport> = new Map();

    const httpServer = http.createServer(async (req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url || '', `http://${req.headers.host}`);

      if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', server: 'wordblast-mcp-server', time: new Date().toISOString() }));
        return;
      }

      if (url.pathname === '/sse') {
        const transport = new SSEServerTransport('/messages', res);
        const server = createMcpServer();

        activeTransports.set(transport.sessionId, transport);

        transport.onclose = () => {
          activeTransports.delete(transport.sessionId);
        };

        await server.connect(transport);
        await transport.start();
        return;
      }

      if (url.pathname === '/messages') {
        const sessionId = url.searchParams.get('sessionId') || (req.headers['x-session-id'] as string);
        const transport = activeTransports.get(sessionId || '');

        if (!transport) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found. Please establish an /sse connection first.' }));
          return;
        }

        await transport.handlePostMessage(req, res);
        return;
      }

      // Default index route
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify(
          {
            name: 'WordBlast Arcade MCP Server',
            version: '1.0.0',
            endpoints: {
              health: '/health',
              sse: '/sse',
              messages: '/messages?sessionId=<id>',
            },
            toolsCount: TOOLS.length,
          },
          null,
          2
        )
      );
    });

    httpServer.listen(port, () => {
      console.log(`[WordBlast MCP Server] Running in SSE HTTP mode on http://localhost:${port}`);
      console.log(`  • SSE Endpoint: http://localhost:${port}/sse`);
      console.log(`  • Health Check: http://localhost:${port}/health`);
    });
  } else {
    // Default: Stdio Transport for local LibreChat / Claude / Antigravity Agents
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

main().catch((err) => {
  console.error('[WordBlast MCP Server] Fatal error:', err);
  process.exit(1);
});
