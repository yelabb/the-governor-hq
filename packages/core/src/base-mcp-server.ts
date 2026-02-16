/**
 * Base MCP Server for Governor HQ Constitutional Framework
 * Provides shared infrastructure for all domain-specific MCP servers
 * 
 * @abstract
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export interface ServerConfig {
  serverName: string;
  uriScheme: string;
  baseDir: string;
  resources: Record<string, string>;
  contextSummary: string;
  version?: string;
  resourceDescriptions?: Record<string, string>;
}

export interface MCPRequest {
  id?: string | number;
  method: string;
  params?: Record<string, any>;
}

export interface MCPResponse {
  id?: string | number | null;
  result?: any;
  error?: {
    message: string;
    code?: number;
  };
}

export interface ResourceInfo {
  uri: string;
  name: string;
  mimeType: string;
  description: string;
}

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

export class BaseGovernorMCPServer {
  protected config: ServerConfig;
  protected resources: Record<string, string>;
  protected contextSummary: string;
  protected resourceDescriptions: Record<string, string>;

  /**
   * @param config - Server configuration
   * @param config.serverName - Name of the MCP server (e.g., 'governor-hq-constitution-bci')
   * @param config.uriScheme - URI scheme for resources (e.g., 'governor-bci')
   * @param config.baseDir - Base directory for resolving resource paths (usually __dirname from subclass)
   * @param config.resources - Map of resource name to file path
   * @param config.contextSummary - Domain-specific context summary
   * @param config.resourceDescriptions - Optional custom resource descriptions
   */
  constructor(config: ServerConfig) {
    if (!config.serverName) {
      throw new Error('serverName is required in config');
    }
    if (!config.uriScheme) {
      throw new Error('uriScheme is required in config');
    }
    if (!config.baseDir) {
      throw new Error('baseDir is required in config');
    }
    if (!config.resources || typeof config.resources !== 'object') {
      throw new Error('resources object is required in config');
    }
    if (!config.contextSummary) {
      throw new Error('contextSummary is required in config');
    }

    this.config = config;
    this.resources = config.resources;
    this.contextSummary = config.contextSummary;
    this.resourceDescriptions = config.resourceDescriptions || this.getDefaultResourceDescriptions();
  }

  /**
   * Read a resource file by name
   * @param name - Resource name
   * @returns File content or null if not found
   */
  readResource(name: string): string | null {
    const resourcePath = this.resources[name];
    if (!resourcePath) {
      return null;
    }

    const fullPath = path.join(this.config.baseDir, resourcePath);
    try {
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error reading resource ${name}:`, errorMessage);
      return null;
    }
  }

  /**
   * Get the context summary for this domain
   * @returns Context summary
   */
  getContextSummary(): string {
    return this.contextSummary;
  }

  /**
   * Get default resource descriptions
   * Can be overridden in subclasses or via config
   * @returns Record of resource names to descriptions
   */
  getDefaultResourceDescriptions(): Record<string, string> {
    return {
      'hard-rules': 'Absolute system limits that override everything',
      'language-rules': 'Required tone and wording controls',
      'quick-reference': 'One-page cheat sheet for validation',
      'what-we-dont-do': 'Scope boundaries and forbidden domains',
      'ai-agent-guide': 'Complete implementation guidance',
      'signals': 'Understanding data limitations',
      'baseline': 'Personal baseline requirements',
    };
  }

  /**
   * Get description for a specific resource
   * @param name - Resource name
   * @returns Description
   */
  getResourceDescription(name: string): string {
    return this.resourceDescriptions[name] || '';
  }

  /**
   * Handle an MCP request
   * @param request - JSON-RPC request
   * @returns JSON-RPC response
   */
  handleRequest(request: MCPRequest): any {
    const { method, params } = request;

    switch (method) {
      case 'initialize':
        return {
          protocolVersion: '1.0.0',
          serverInfo: {
            name: this.config.serverName,
            version: this.config.version || '1.0.0',
          },
          capabilities: {
            resources: {
              listChanged: false,
            },
          },
        };

      case 'resources/list':
        return {
          resources: Object.keys(this.resources).map((name): ResourceInfo => ({
            uri: `${this.config.uriScheme}://${name}`,
            name: name,
            mimeType: 'text/markdown',
            description: this.getResourceDescription(name),
          })),
        };

      case 'resources/read':
        if (params?.uri) {
          const name = params.uri.replace(`${this.config.uriScheme}://`, '');
          const content = this.readResource(name);
          if (content) {
            return {
              contents: [
                {
                  uri: params.uri,
                  mimeType: 'text/markdown',
                  text: content,
                } as ResourceContent,
              ],
            };
          }
        }
        throw new Error('Resource not found');

      case 'context/summary':
        return {
          summary: this.getContextSummary(),
        };

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  /**
   * Start the MCP server and listen for requests
   */
  start(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on('line', (line: string) => {
      let request: MCPRequest | undefined;
      try {
        request = JSON.parse(line) as MCPRequest;
        const response = this.handleRequest(request);
        console.log(JSON.stringify({ id: request.id, result: response }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(
          JSON.stringify({
            id: request?.id || null,
            error: { message: errorMessage },
          } as MCPResponse)
        );
      }
    });

    // Send initialization ready on startup
    console.log(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialized',
        params: {},
      })
    );
  }
}
