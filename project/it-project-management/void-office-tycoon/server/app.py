from __future__ import annotations

from typing import Any, Awaitable, Callable

from aiohttp import web

from game_rules import (
    RuleError,
    apply_debug_action,
    build_report,
    build_world_cell,
    buy_department,
    escape_check,
    ensure_world,
    new_session,
    record_minigame_result,
    set_pause,
)
from storage import (
    StorageError,
    append_log,
    ensure_dirs,
    load_log,
    load_proposal,
    load_session,
    save_session,
)


JsonHandler = Callable[[web.Request], Awaitable[web.StreamResponse]]


def json_response(payload: dict[str, Any], status: int = 200) -> web.Response:
    return web.json_response(payload, status=status)


async def read_payload(request: web.Request) -> dict[str, Any]:
    if not request.can_read_body:
        return {}
    try:
        payload = await request.json()
    except Exception:
        return {}
    return payload if isinstance(payload, dict) else {}


@web.middleware
async def cors_middleware(request: web.Request, handler: JsonHandler) -> web.StreamResponse:
    allowed_origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    }
    request_origin = request.headers.get("Origin")

    if request.method == "OPTIONS":
        response = web.Response(status=204)
    else:
        try:
            response = await handler(request)
        except RuleError as exc:
            response = json_response({"ok": False, "error": str(exc)}, status=400)
        except StorageError as exc:
            response = json_response({"ok": False, "error": str(exc)}, status=404)
        except FileNotFoundError:
            response = json_response({"ok": False, "error": "Session not found."}, status=404)

    response.headers["Access-Control-Allow-Origin"] = (
        request_origin if request_origin in allowed_origins else "http://127.0.0.1:5173"
    )
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


async def health(_: web.Request) -> web.Response:
    return json_response({"ok": True, "service": "void-office-tycoon-api"})


async def get_proposal(_: web.Request) -> web.Response:
    proposal = load_proposal()
    return json_response({"ok": True, "proposal": proposal})


async def create_session(request: web.Request) -> web.Response:
    payload = await read_payload(request)
    session = new_session(payload.get("studentId"))
    save_session(session)
    append_log(
        session["sessionId"],
        {
            "studentId": session["studentId"],
            "minigameId": None,
            "departmentBuilt": None,
            "resourceChange": {},
            "timestamp": session["createdAt"],
            "finalResult": None,
        },
    )
    return json_response({"ok": True, "session": session}, status=201)


async def get_session(request: web.Request) -> web.Response:
    session = load_session(request.match_info["session_id"])
    ensure_world(session)
    save_session(session)
    return json_response({"ok": True, "session": session})


async def post_minigame_result(request: web.Request) -> web.Response:
    session = load_session(request.match_info["session_id"])
    payload = await read_payload(request)
    session, result, log_entry = record_minigame_result(session, payload)
    save_session(session)
    append_log(session["sessionId"], log_entry)
    return json_response({"ok": True, "session": session, "result": result})


async def post_buy_department(request: web.Request) -> web.Response:
    session = load_session(request.match_info["session_id"])
    payload = await read_payload(request)
    department_id = payload.get("departmentId")
    if not department_id:
        raise RuleError("departmentId is required.")
    session, action, log_entry = buy_department(
        session,
        str(department_id),
        payload.get("anchorCell"),
        payload.get("rotation", 0),
        str(payload.get("presetId", "single")),
    )
    save_session(session)
    append_log(session["sessionId"], log_entry)
    return json_response({"ok": True, "session": session, "action": action})


async def post_build_world_cell(request: web.Request) -> web.Response:
    session = load_session(request.match_info["session_id"])
    payload = await read_payload(request)
    try:
        x = int(payload.get("x"))
        y = int(payload.get("y"))
    except (TypeError, ValueError):
        raise RuleError("x and y are required integer grid coordinates.")
    session, action, log_entry = build_world_cell(session, x, y)
    save_session(session)
    append_log(session["sessionId"], log_entry)
    return json_response({"ok": True, "session": session, "action": action})


async def post_pause(request: web.Request) -> web.Response:
    session = load_session(request.match_info["session_id"])
    payload = await read_payload(request)
    session = set_pause(session, bool(payload.get("paused")))
    save_session(session)
    return json_response({"ok": True, "session": session})


async def post_escape_check(request: web.Request) -> web.Response:
    session = load_session(request.match_info["session_id"])
    session, result, log_entry = escape_check(session)
    save_session(session)
    append_log(session["sessionId"], log_entry)
    return json_response({"ok": True, "session": session, "result": result})


async def post_debug_apply(request: web.Request) -> web.Response:
    session = load_session(request.match_info["session_id"])
    payload = await read_payload(request)
    action = payload.get("action")
    if not action:
        raise RuleError("action is required.")
    session, debug_result, log_entry = apply_debug_action(session, str(action), payload.get("value"))
    save_session(session)
    append_log(session["sessionId"], log_entry)
    return json_response({"ok": True, "session": session, "debugResult": debug_result})


async def get_report(request: web.Request) -> web.Response:
    session = load_session(request.match_info["session_id"])
    report = build_report(session, load_proposal())
    return json_response({"ok": True, "report": report})


async def get_log(request: web.Request) -> web.Response:
    session_id = request.match_info["session_id"]
    return json_response({"ok": True, "log": load_log(session_id)})


async def options_handler(_: web.Request) -> web.Response:
    return web.Response(status=204)


def create_app() -> web.Application:
    ensure_dirs()
    app = web.Application(middlewares=[cors_middleware])
    app.router.add_get("/api/health", health)
    app.router.add_get("/api/proposal", get_proposal)
    app.router.add_post("/api/sessions", create_session)
    app.router.add_get("/api/sessions/{session_id}", get_session)
    app.router.add_post("/api/sessions/{session_id}/minigame-result", post_minigame_result)
    app.router.add_post("/api/sessions/{session_id}/buy-department", post_buy_department)
    app.router.add_post("/api/sessions/{session_id}/build-world-cell", post_build_world_cell)
    app.router.add_post("/api/sessions/{session_id}/pause", post_pause)
    app.router.add_post("/api/sessions/{session_id}/escape-check", post_escape_check)
    app.router.add_post("/api/sessions/{session_id}/debug/apply", post_debug_apply)
    app.router.add_get("/api/sessions/{session_id}/report", get_report)
    app.router.add_get("/api/sessions/{session_id}/log", get_log)
    app.router.add_route("OPTIONS", "/{tail:.*}", options_handler)
    return app


if __name__ == "__main__":
    web.run_app(create_app(), host="127.0.0.1", port=8000)
