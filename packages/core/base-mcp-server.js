/**
 * Base MCP Server for Governor HQ Constitutional Framework
 * Provides shared infrastructure for all domain-specific MCP servers
 * 
 * @abstract
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class BaseGovernorMCPServer {
  /**
   * @param {Object} config - Server configuration
   * @param {string} config.serverName - Name of the MCP server (e.g., 'governor-hq-constitution-bci')
   * @param {string} config.uriScheme - URI scheme for resources (e.g., 'governor-bci')
   * @param {string} config.baseDir - Base directory for resolving resource paths (usually __dirname from subclass)
   * @param {Object.<string, string>} config.resources - Map of resource name to file path
   * @param {string} config.contextSummary - Domain-specific context summary
   * @param {Object.<string, string>} [config.resourceDescriptions] - Optional custom resource descriptions
   */
  constructor(config) {
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
   * @param {string} name - Resource name
   * @returns {string|null} File content or null if not found
   */
  readResource(name) {
    const resourcePath = this.resources[name];
    if (!resourcePath) {
      return null;
    }

    const fullPath = path.join(this.config.baseDir, resourcePath);
    try {
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      console.error(`Error reading resource ${name}:`, error.message);
      return null;
    }
  }

  /**
   * Get the context summary for this domain
   * @returns {string} Context summary
   */
  getContextSummary() {
    return this.contextSummary;
  }

  /**
   * Get default resource descriptions
   * Can be overridden in subclasses or via config
   * @returns {Object.<string, string>}
   */
  getDefaultResourceDescriptions() {
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
   * @param {string} name - Resource name
   * @returns {string} Description
   */
  getResourceDescription(name) {
    return this.resourceDescriptions[name] || '';
  }

  /**
   * Handle an MCP request
   * @param {Object} request - JSON-RPC request
   * @returns {Object} JSON-RPC response
   */
  handleRequest(request) {
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
          resources: Object.keys(this.resources).map((name) => ({
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
                },
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
  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on('line', (line) => {
      try {
        const request = JSON.parse(line);
        const response = this.handleRequest(request);
        console.log(JSON.stringify({ id: request.id, result: response }));
      } catch (error) {
        console.log(
          JSON.stringify({
            id: request?.id || null,
            error: { message: error.message },
          })
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

module.exports = BaseGovernorMCPServer;
