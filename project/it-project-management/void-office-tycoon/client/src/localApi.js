// localApi.js
// Mock API that replaces the Python backend for static deployment

import * as rules from './local_game_rules.js';

const STORAGE_KEY = 'voidOfficeTycoon.backendSession';

function saveSession(session) {
    if (!session || !session.sessionId) return;
    localStorage.setItem(`${STORAGE_KEY}_${session.sessionId}`, JSON.stringify(session));
}

function appendLog(session, logEntry) {
    if (!session.choiceLog) session.choiceLog = [];
    session.choiceLog.push(logEntry);
}

function loadSession(sessionId) {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${sessionId}`);
    if (!raw) throw new Error("Session not found.");
    return JSON.parse(raw);
}

function delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const localApi = {
    async request(path, options = {}) {
        await delay(50); // Simulate network latency slightly
        try {
            const result = await this.route(path, options);
            if (!result.ok) throw new Error(result.error || `Request failed`);
            return result;
        } catch (error) {
            console.error("localApi Error:", error);
            throw new Error(error.message || `Request failed`);
        }
    },
    
    get(path) {
        return this.request(path, { method: 'GET' });
    },
    
    post(path, body = {}) {
        return this.request(path, { method: 'POST', body: JSON.stringify(body) });
    },

    async route(path, options) {
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : {};

        if (method === 'GET' && path === '/api/proposal') {
            // Provide a default proposal state since we don't load from a file anymore
            return { ok: true, proposal: { state: { projectTitle: "Void Office Tycoon" } } };
        }

        if (method === 'POST' && path === '/api/sessions') {
            const session = rules.new_session(body.studentId);
            session.displayName = body.displayName || session.studentId;
            appendLog(session, {
                eventType: 'session_start',
                studentId: session.studentId,
                minigameId: '',
                departmentBuilt: '',
                resourceChange: {},
                score: 0,
                points: session.points,
                pointsEarned: 0,
                totalEarned: session.totalEarned || 0,
                totalSpent: session.totalSpent || 0,
                finalScore: session.finalScore || 0,
                success: false,
                resources: JSON.parse(JSON.stringify(session.resources)),
                timestamp: session.createdAt,
                finalResult: ''
            });
            saveSession(session);
            return { ok: true, session };
        }

        // Match /api/sessions/{session_id}/*
        const sessionMatch = path.match(/^\/api\/sessions\/([^/]+)(?:\/(.*))?$/);
        if (!sessionMatch) {
            return { ok: false, error: "Not found" };
        }
        
        const sessionId = sessionMatch[1];
        const action = sessionMatch[2];

        if (method === 'GET' && !action) {
            let session = loadSession(sessionId);
            session = rules.ensure_world(session);
            saveSession(session);
            return { ok: true, session };
        }

        if (method === 'POST' && action === 'minigame-result') {
            let session = loadSession(sessionId);
            const { session: updatedSession, result } = rules.record_minigame_result(session, body);
            appendLog(updatedSession, {
                eventType: 'minigame_result',
                studentId: updatedSession.studentId,
                minigameId: result.minigameId || '',
                departmentBuilt: '',
                resourceChange: result.resourceChange || {},
                score: result.score || 0,
                points: updatedSession.points,
                pointsEarned: result.pointsEarned || 0,
                totalEarned: updatedSession.totalEarned || 0,
                totalSpent: updatedSession.totalSpent || 0,
                finalScore: updatedSession.finalScore || 0,
                success: result.success || false,
                resources: JSON.parse(JSON.stringify(updatedSession.resources)),
                timestamp: result.timestamp,
                finalResult: updatedSession.finalResult ? updatedSession.finalResult.status : ''
            });
            saveSession(updatedSession);
            return { ok: true, session: updatedSession, result };
        }

        if (method === 'POST' && action === 'buy-department') {
            let session = loadSession(sessionId);
            const { session: updatedSession, action: act } = rules.buy_department(
                session, body.departmentId, body.anchorCell, body.rotation || 0, body.presetId || 'single'
            );
            appendLog(updatedSession, {
                eventType: 'buy_department',
                studentId: updatedSession.studentId,
                minigameId: '',
                departmentBuilt: act.departmentName || '',
                resourceChange: act.resourceChange || {},
                score: 0,
                points: updatedSession.points,
                pointsEarned: -(act.cost || 0),
                totalEarned: updatedSession.totalEarned || 0,
                totalSpent: updatedSession.totalSpent || 0,
                finalScore: updatedSession.finalScore || 0,
                success: true,
                resources: JSON.parse(JSON.stringify(updatedSession.resources)),
                timestamp: act.timestamp,
                finalResult: updatedSession.finalResult ? updatedSession.finalResult.status : ''
            });
            saveSession(updatedSession);
            return { ok: true, session: updatedSession, action: act };
        }

        if (method === 'POST' && action === 'build-world-cell') {
            let session = loadSession(sessionId);
            const { session: updatedSession, action: act } = rules.build_world_cell(session, parseInt(body.x, 10), parseInt(body.y, 10));
            appendLog(updatedSession, {
                eventType: 'build_path',
                studentId: updatedSession.studentId,
                minigameId: '',
                departmentBuilt: `Path ${body.x},${body.y}`,
                resourceChange: {},
                score: 0,
                points: updatedSession.points,
                pointsEarned: act.lost ? 0 : -(act.cost || 0),
                totalEarned: updatedSession.totalEarned || 0,
                totalSpent: updatedSession.totalSpent || 0,
                finalScore: updatedSession.finalScore || 0,
                success: act.built || false,
                resources: JSON.parse(JSON.stringify(updatedSession.resources)),
                timestamp: new Date().toISOString(),
                finalResult: updatedSession.finalResult ? updatedSession.finalResult.status : ''
            });
            saveSession(updatedSession);
            return { ok: true, session: updatedSession, action: act };
        }

        if (method === 'POST' && action === 'pause') {
            let session = loadSession(sessionId);
            const updatedSession = rules.set_pause(session, body.paused);
            saveSession(updatedSession);
            return { ok: true, session: updatedSession };
        }

        if (method === 'POST' && action === 'escape-check') {
            let session = loadSession(sessionId);
            const { session: updatedSession, result } = rules.escape_check(session);
            appendLog(updatedSession, {
                eventType: 'escape_check',
                studentId: updatedSession.studentId,
                minigameId: '',
                departmentBuilt: 'Escape Check',
                resourceChange: {},
                score: result.eligible ? 1 : 0,
                points: updatedSession.points,
                pointsEarned: 0,
                totalEarned: updatedSession.totalEarned || 0,
                totalSpent: updatedSession.totalSpent || 0,
                finalScore: updatedSession.finalScore || 0,
                success: result.eligible || false,
                resources: JSON.parse(JSON.stringify(updatedSession.resources)),
                timestamp: new Date().toISOString(),
                finalResult: updatedSession.finalResult ? updatedSession.finalResult.status : ''
            });
            saveSession(updatedSession);
            return { ok: true, session: updatedSession, result };
        }

        if (method === 'POST' && action === 'debug/apply') {
            // Optional: Implement if debug panel is needed in static build
            return { ok: false, error: "Debug actions not fully supported in static build" };
        }

        if (method === 'GET' && action === 'report') {
            let session = loadSession(sessionId);
            const report = rules.build_report(session, { state: { projectTitle: "Void Office Tycoon" } });
            return { ok: true, report };
        }

        if (method === 'GET' && action === 'log') {
            let session = loadSession(sessionId);
            return { ok: true, log: session.choiceLog || [] };
        }

        return { ok: false, error: `Unhandled localApi route: ${method} ${path}` };
    }
};
