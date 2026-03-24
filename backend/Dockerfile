# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Keep pip cache local to the layer, make sure python output is unbuffered
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./

# Collect static files (if needed) (change or remove if no static collection needed)
# RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
