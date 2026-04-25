export type LogLevel = "info" | "warn" | "error";

export function createRequestLogger(action: string) {
  const requestId = crypto.randomUUID();

  const log = (level: LogLevel, message: string, metadata?: Record<string, unknown>) => {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      action,
      requestId,
      message,
      ...(metadata ?? {}),
    };

    if (level === "error") {
      console.error(JSON.stringify(payload));
      return;
    }

    if (level === "warn") {
      console.warn(JSON.stringify(payload));
      return;
    }

    console.log(JSON.stringify(payload));
  };

  return {
    requestId,
    info: (message: string, metadata?: Record<string, unknown>) => log("info", message, metadata),
    warn: (message: string, metadata?: Record<string, unknown>) => log("warn", message, metadata),
    error: (message: string, metadata?: Record<string, unknown>) => log("error", message, metadata),
  };
}
