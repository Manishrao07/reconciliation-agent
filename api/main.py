from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.logging import setup_logging, CorrelationIdMiddleware
from api.routers import auth

# Initialize logging
logger = setup_logging()

app = FastAPI(
    title="Autonomous Finance Reconciliation Agent",
    version="1.0.0",
    description="API for the Autonomous Finance Reconciliation Agent",
)

# Middleware
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)

@app.get("/health", tags=["system"])
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy"}
