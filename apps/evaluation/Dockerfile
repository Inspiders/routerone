FROM python:3.11-slim

WORKDIR /app

# Install dependencies separately so Docker can cache this layer
# and skip re-installing when only the source code changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 3002

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3002"]
