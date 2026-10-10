import logging
import uuid
from pythonjsonlogger import jsonlogger
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from contextvars import ContextVar

correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")

class CorrelationIdFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = correlation_id.get()
        return True

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    logHandler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s %(correlation_id)s')
    logHandler.setFormatter(formatter)
    
    logger.addHandler(logHandler)
    logger.addFilter(CorrelationIdFilter())
    return logger

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        correlation_id.set(req_id)
        
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = req_id
        return response
