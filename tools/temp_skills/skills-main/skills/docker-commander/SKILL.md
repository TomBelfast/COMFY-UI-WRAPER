name: docker-commander
description: Masterful container orchestration, image optimization, and environment management using Docker and Docker Compose. Use for designing production-ready Dockerfiles, multi-stage builds, networking configurations, and complex multi-container local development environments.
metadata:
  short-description: Docker & Infrastructure Expert
---

# Docker Commander Skill

Expertise in containerization, infrastructure-as-code patterns, and development workflow optimization.

## Core Expertise

### 1. Dockerfile Optimization
- Use **Multi-stage builds** to minimize image size.
- Optimize layer caching (copy package files before source).
- Use small base images (Alpine, distroless).
- Implement non-root users for security.

### 2. Docker Compose Orchestration
- Design complex multi-service environments.
- Use healthchecks and dependency management (`depends_on`).
- Manage volumes and persistent data correctly.
- Implement variable substitution for environment-specific configs.

### 3. Networking & Security
- Custom networks for service isolation.
- Secret management in Docker.
- Vulnerability scanning with `docker scout` or `trivy`.

### 4. CI/CD Integration
- Build scripts and automated testing in containers.
- Integration with Kubernetes (basic manifest generation).

## Behavioral Patterns
- Always suggest `.dockerignore` for efficiency.
- Prefer explicit version tags over `latest`.
- Focus on reproducibility and "it works on my machine" consistency.
