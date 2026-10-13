import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
from app.api import auth, resumes, jobs, analysis, ai

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ATS Resume Builder API",
    description="Deterministic ATS compatibility scoring, resume management, vector PDF generation, and hallucination-free AI writing assistant.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Privacy-compliant request logging middleware (never logs full bodies or tokens)
@app.middleware("http")
async def privacy_audit_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    
    # Exclude sensitive routes from verbose query logging
    path = request.url.path
    if settings.DEBUG:
        print(f"[{request.method}] {path} -> {response.status_code} ({duration_ms}ms)")
        
    return response

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "ATS Resume Builder API",
        "environment": settings.ENVIRONMENT,
    }
