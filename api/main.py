from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from core.logging import setup_logging, CorrelationIdMiddleware
# Initialize logging
logger = setup_logging()

app = FastAPI(
    title="Autonomous Finance Reconciliation Agent",
    version="1.0.0",
    description="API for the Autonomous Finance Reconciliation Agent",
)

from fastapi import Request
from fastapi.responses import JSONResponse
from core.logging import correlation_id

# Middleware
app.add_middleware(CorrelationIdMiddleware)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    req_id = correlation_id.get() or "unknown"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "correlation_id": req_id}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    req_id = correlation_id.get() or "unknown"
    logger.error("Unhandled exception", error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "correlation_id": req_id}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.routers import auth, uploads, runs, discrepancies, audit

# Routers
app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(runs.router)
app.include_router(discrepancies.router)
app.include_router(audit.router)

@app.get("/health", tags=["system"])
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy"}
