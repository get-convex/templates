// Dual logging utility - logs to both browser console and terminal

type LogLevel = 'info' | 'warn' | 'error';
type LogData = Record<string, unknown> | string | number | boolean | null | undefined;

class DualLogger {
  private async logToTerminal(level: LogLevel, message: string, data?: LogData): Promise<void> {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          data
        })
      });
    } catch (error) {
      // If terminal logging fails, at least log to browser console
      console.error('Failed to log to terminal:', error);
    }
  }

  private logToBrowser(level: LogLevel, message: string, data?: LogData): void {
    const logMessage = data ? `${message} ${JSON.stringify(data, null, 2)}` : message;

    switch (level) {
      case 'info':
        console.log(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
    }
  }

  async log(message: string, data?: LogData): Promise<void> {
    this.logToBrowser('info', message, data);
    await this.logToTerminal('info', message, data);
  }

  async warn(message: string, data?: LogData): Promise<void> {
    this.logToBrowser('warn', message, data);
    await this.logToTerminal('warn', message, data);
  }

  async error(message: string, data?: LogData): Promise<void> {
    this.logToBrowser('error', message, data);
    await this.logToTerminal('error', message, data);
  }

  // Synchronous versions for critical paths where we can't wait
  logSync(message: string, data?: LogData): void {
    this.logToBrowser('info', message, data);
    // Fire and forget to terminal
    this.logToTerminal('info', message, data);
  }

  errorSync(message: string, data?: LogData): void {
    this.logToBrowser('error', message, data);
    // Fire and forget to terminal
    this.logToTerminal('error', message, data);
  }
}

// Export singleton instance
export const logger = new DualLogger();

// Convenience functions for common voice agent events
export const voiceAgentLog = {
  auth: (message: string, data?: LogData) => logger.logSync(`🔐 AUTH: ${message}`, data),
  connection: (message: string, data?: LogData) => logger.logSync(`🔌 CONNECTION: ${message}`, data),
  agentEvent: (message: string, data?: LogData) => logger.logSync(`🤖 AGENT EVENT: ${message}`, data),
  audio: (message: string, data?: LogData) => logger.logSync(`🔊 AUDIO: ${message}`, data),
  conversation: (message: string, data?: LogData) => logger.logSync(`💬 CONVERSATION: ${message}`, data),
  error: (message: string, data?: LogData) => logger.errorSync(`❌ ERROR: ${message}`, data),
  microphone: (message: string, data?: LogData) => logger.logSync(`🎙️ MICROPHONE: ${message}`, data),
  keepalive: (message: string, data?: LogData) => logger.logSync(`💓 KEEPALIVE: ${message}`, data),
};
