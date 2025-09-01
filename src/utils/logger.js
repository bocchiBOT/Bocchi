import config from '../config.js';

class Logger {
    constructor() {
        this.colors = config.logger.colors;
        this.level = config.logger.level;
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            success: 2 // Treated as info level
        };
    }

    _getTimestamp() {
        return new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    _shouldLog(level) {
        const currentLevel = this.levels[this.level] || 2;
        const messageLevel = this.levels[level] || 2;
        return messageLevel <= currentLevel;
    }

    _formatMessage(level, args) {
        const timestamp = this._getTimestamp();
        const color = this.colors[level] || this.colors.reset;
        const prefix = `${color}[${timestamp}] [${level.toUpperCase()}]${this.colors.reset}`;
        return [prefix, ...args];
    }

    _log(level, ...args) {
        if (!this._shouldLog(level)) return;
        
        const formattedMessage = this._formatMessage(level, args);
        
        if (level === 'error') {
            console.error(...formattedMessage);
        } else {
            console.log(...formattedMessage);
        }
    }

    error(...args) {
        this._log('error', ...args);
    }

    warn(...args) {
        this._log('warn', ...args);
    }

    info(...args) {
        this._log('info', ...args);
    }

    debug(...args) {
        this._log('debug', ...args);
    }

    success(...args) {
        this._log('success', ...args);
    }
}

export default new Logger();
