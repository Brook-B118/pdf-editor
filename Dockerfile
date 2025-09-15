FROM python:3.10-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic1 file \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# COPY . .

# create runtime dirs and fix ownership (build-time)
RUN mkdir -p /app/static/uploaded_files /app/static/temp_uploaded_files \
    && mkdir -p /app/instance /app/flask_session \
    && groupadd --system appgroup \
    && useradd  --system --no-create-home --gid appgroup appuser \
    && chown -R appuser:appgroup /app/static/uploaded_files /app/static/temp_uploaded_files /app/instance /app/flask_session

# Switch to the new user
USER appuser

CMD ["python", "app.py", "--host=0.0.0.0", "--port=8000"]
