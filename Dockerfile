# Use the official Python image from the Docker Hub
FROM python:3.12-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Install Poetry
RUN pip install --no-cache-dir poetry

# Copy the pyproject.toml and poetry.lock files
COPY pyproject.toml poetry.lock /app/

# Install prod and dev dependencies
FROM base AS dev-build
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi --no-root

# Install prod dependencies
FROM base AS prod-build
RUN poetry config virtualenvs.create false && poetry install --only main --no-interaction --no-ansi --no-root

FROM dev-build AS dev
# Copy the project files
COPY --from=dev-build . /app/ 
# Expose the port the app runs on
EXPOSE 8000
# Run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

FROM prod-build AS prod
# Copy the project files
COPY --from=prod-build . /app/ 
# Expose the port the app runs on
EXPOSE 8000
# Run the Django development server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "remind_me.wsgi:application"]