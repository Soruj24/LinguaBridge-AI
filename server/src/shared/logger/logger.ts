type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private context: string;
  private minLevel: LogLevel;

  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  constructor(context = "app", minLevel: LogLevel = "info") {
    this.context = context;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.LOG_LEVELS[level] <= this.LOG_LEVELS[this.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      return `${base} ${JSON.stringify(entry.metadata)}`;
    }
    return base;
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    stack?: string
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      metadata,
      stack,
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  error(
    message: string,
    metadata?: Record<string, unknown>,
    stack?: string
  ): void {
    this.log("error", message, metadata, stack);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log("warn", message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log("info", message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log("debug", message, metadata);
  }

  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.minLevel);
  }
}

const nodeEnv = process.env.NODE_ENV || "development";
const minLevel: LogLevel = nodeEnv === "production" ? "info" : "debug";

export const logger = new Logger("app", minLevel);
export { Logger };
