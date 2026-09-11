FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight CPU-only PyTorch (reduces image size and memory usage on Render)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY Backend/ ./Backend/

# Create persistent uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn Backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
