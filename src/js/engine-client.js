/**
 * ============================================================================
 * AIRLECHOO Engine Client Adapter
 * Bridges Echoo Frontend UI to Go IDE Server (:1234) & Terminal Server (:1236)
 * ============================================================================
 */

(function(window) {
  'use strict';

  const DEFAULT_TOKEN = 'mc6johzi7t8l';
  const BRIDGE_URL = 'http://127.0.0.1:1234';
  const TERMINAL_URL = 'http://127.0.0.1:1236';
  const TERMINAL_WS_URL = 'ws://127.0.0.1:1236';

  function buildFramedHeader(token) {
    const t = String(token || DEFAULT_TOKEN).trim().slice(0, 12).padEnd(12, ' ');
    return `x-ag${t}_9qx`;
  }

  class EngineClient {
    constructor() {
      this.bridgeUrl = BRIDGE_URL;
      this.terminalUrl = TERMINAL_URL;
      this.token = localStorage.getItem('echoo.engine_token') || DEFAULT_TOKEN;
      this.isOnline = false;
      this.hubStatus = 'checking';
      this.models = [];
      this.activeConversationId = null;
      this.ws = null;
      this.listeners = new Set();
      
      this.init();
    }

    get authHeader() {
      const headerName = buildFramedHeader(this.token);
      return { [headerName]: this.token };
    }

    async init() {
      await this.checkStatus();
      // Periodically refresh status
      setInterval(() => this.checkStatus(), 15000);
    }

    onStatusChange(fn) {
      this.listeners.add(fn);
      fn(this.isOnline, this.hubStatus);
      return () => this.listeners.delete(fn);
    }

    notifyStatus() {
      this.listeners.forEach(fn => {
        try { fn(this.isOnline, this.hubStatus); } catch(e){}
      });
    }

    async request(endpoint, options = {}) {
      const url = endpoint.startsWith('http') ? endpoint : `${this.bridgeUrl}${endpoint}`;
      const headers = {
        'Accept': 'application/json',
        ...this.authHeader,
        ...(options.headers || {})
      };

      try {
        const resp = await fetch(url, { ...options, headers });
        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${errText || resp.statusText}`);
        }
        return await resp.json();
      } catch (err) {
        // If connection failed
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          this.isOnline = false;
          this.hubStatus = 'offline';
          this.notifyStatus();
        }
        throw err;
      }
    }

    async checkStatus() {
      try {
        const res = await this.request('/api/status');
        this.isOnline = true;
        this.hubStatus = (res && res.hub && res.hub.status) || 'online';
        this.notifyStatus();
        return res;
      } catch (e) {
        // Fallback: check /api/health
        try {
          const h = await fetch(`${this.bridgeUrl}/api/health`).then(r => r.json());
          if (h && h.status === 'ok') {
            this.isOnline = true;
            this.hubStatus = 'unauthorized';
            this.notifyStatus();
            return h;
          }
        } catch (_) {}

        this.isOnline = false;
        this.hubStatus = 'offline';
        this.notifyStatus();
        return null;
      }
    }

    // --- Models ---
    async getModels() {
      try {
        const res = await this.request('/api/models');
        if (res && Array.isArray(res.models) && res.models.length > 0) {
          this.models = res.models;
          return res.models;
        }
      } catch (e) {}

      // Fallback default agent models supported by Antigravity / Claude / Codex
      return [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', desc: 'Fast, reasoning, agentic coding' },
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', desc: 'Deep multi-step reasoning' },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', desc: 'Advanced coding & agent loop' },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', desc: 'High capability omni model' },
        { id: 'codex', name: 'Codex CLI', provider: 'openai', desc: 'Specialized code generation & execution' }
      ];
    }

    async getQuotas() {
      try {
        return await this.request('/api/quotas');
      } catch (e) {
        return null;
      }
    }

    // --- Projects ---
    async getProjects() {
      try {
        return await this.request('/api/projects');
      } catch (e) {
        return [];
      }
    }

    async createProject(name, path) {
      return await this.request('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, path })
      });
    }

    // --- Filesystem ---
    async fsBrowse(path = '') {
      const q = path ? `?path=${encodeURIComponent(path)}` : '';
      return await this.request(`/api/fs/browse${q}`);
    }

    async fsRoots() {
      return await this.request('/api/fs/roots');
    }

    async fsReadFile(path) {
      return await this.request(`/api/fs/read?path=${encodeURIComponent(path)}`);
    }

    async fsSaveFile(path, content, expectedHash = '') {
      return await this.request('/api/fs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content, expectedHash, force: true })
      });
    }

    async fsCreate(path, isDir = false) {
      return await this.request('/api/fs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, isDir })
      });
    }

    async fsDelete(path) {
      return await this.request('/api/fs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
    }

    // --- Git ---
    async gitStatus(projectPath) {
      return await this.request(`/api/git/status?path=${encodeURIComponent(projectPath)}`);
    }

    async gitCommit(projectPath, message) {
      return await this.request('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: projectPath, message })
      });
    }

    async gitDiff(projectPath) {
      return await this.request(`/api/git/diff?path=${encodeURIComponent(projectPath)}`);
    }

    // --- Real Termux Terminal Execution ---
    async execCommand(command, cwd = null) {
      try {
        const resp = await fetch(`${this.terminalUrl}/api/terminal/exec`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command, cwd, timeout: 60 })
        });
        if (!resp.ok) {
          throw new Error(`Terminal returned HTTP ${resp.status}`);
        }
        return await resp.json();
      } catch (err) {
        // Fallback: If python terminal bridge is not running, check bridge /api/agy/cli
        return {
          exit_code: 1,
          stdout: '',
          stderr: `Terminal Bridge offline (${err.message}). Start airlechoo.sh to enable live shell.`
        };
      }
    }

    connectTerminalWebSocket(onData, onOpen, onClose) {
      try {
        const ws = new WebSocket(TERMINAL_WS_URL);
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          onOpen && onOpen();
        };

        ws.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) {
            const text = new TextDecoder('utf-8').decode(event.data);
            onData && onData(text);
          } else {
            onData && onData(event.data);
          }
        };

        ws.onclose = () => {
          onClose && onClose();
        };

        ws.onerror = () => {
          onClose && onClose();
        };

        return {
          write(data) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(data);
            }
          },
          resize(cols, rows) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'resize', cols, rows }));
            }
          },
          close() {
            ws.close();
          }
        };
      } catch (e) {
        return null;
      }
    }

    // --- Conversations & Live Agent Execution ---
    async getConversations() {
      return await this.request('/api/conversations');
    }

    async sendPrompt(text, options = {}, callbacks = {}) {
      const { model = 'gemini-2.5-flash', deep = false, cwd = '' } = options;
      const { onToken, onThought, onToolCall, onComplete, onError } = callbacks;

      // Check if engine is available
      if (!this.isOnline) {
        throw new Error('Engine bridge is offline');
      }

      // Check active conversations or create one
      try {
        let convId = this.activeConversationId;
        if (!convId) {
          const list = await this.getConversations();
          if (list && list.conversations && list.conversations.length > 0) {
            convId = list.conversations[0].id;
          }
        }

        // Post turn to conversation or execute command
        // If Antigravity hub is active on 1235:
        const payload = {
          prompt: text,
          model: model,
          deepThink: deep,
          cwd: cwd || '/data/user/0/com.termux/files/home/AIRLECHOO'
        };

        // Use streaming if available, else standard post
        const res = await this.request(`/api/conversations/${convId || 'default'}/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res && res.response) {
          onToken && onToken(res.response);
          onComplete && onComplete(res.response);
          return res.response;
        }

        return res;
      } catch (err) {
        onError && onError(err);
        throw err;
      }
    }
  }

  // Export singleton to window
  window.EngineClient = new EngineClient();

})(window);
