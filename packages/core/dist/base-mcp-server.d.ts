/**
 * Base MCP Server for Governor HQ Constitutional Framework
 * Provides shared infrastructure for all domain-specific MCP servers
 *
 * @abstract
 */
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
export declare class BaseGovernorMCPServer {
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
    constructor(config: ServerConfig);
    /**
     * Read a resource file by name
     * @param name - Resource name
     * @returns File content or null if not found
     */
    readResource(name: string): string | null;
    /**
     * Get the context summary for this domain
     * @returns Context summary
     */
    getContextSummary(): string;
    /**
     * Get default resource descriptions
     * Can be overridden in subclasses or via config
     * @returns Record of resource names to descriptions
     */
    getDefaultResourceDescriptions(): Record<string, string>;
    /**
     * Get description for a specific resource
     * @param name - Resource name
     * @returns Description
     */
    getResourceDescription(name: string): string;
    /**
     * Handle an MCP request
     * @param request - JSON-RPC request
     * @returns JSON-RPC response
     */
    handleRequest(request: MCPRequest): any;
    /**
     * Start the MCP server and listen for requests
     */
    start(): void;
}
//# sourceMappingURL=base-mcp-server.d.ts.map