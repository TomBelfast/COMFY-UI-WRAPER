name: pydantic-validation
description: Expert data modeling, validation, and schema generation using Pydantic. Use for creating robust data pipelines, API contracts, JSON schema serialization, and configuration management. Specialized in Pydantic v2's performance and advanced features like discriminators, generic models, and custom types.
metadata:
  short-description: Pydantic Data Modeling Expert
---

# Pydantic Validation Skill

Expertise in structured data modeling and strict validation using the Pydantic framework.

## Core Expertise

### 1. Model Design
- Use `BaseModel` for core data structures.
- Implement `RootModel` for custom top-level types.
- Use `Generic` models for reusable data patterns.
- Leverage `TypeAdapter` for validating non-model types.

### 2. Validation Logic
- Implement `field_validator` (class methods) for specific fields.
- Use `model_validator` for cross-field validation.
- Custom validation logic using `Annotated` and `AfterValidator`.

### 3. Advanced Features
- **Discriminated Unions**: Efficiently handle polymorphic data.
- **Computed Fields**: Add derived properties with `@computed_field`.
- **JSON Schema**: Advanced customization of generated schemas.
- **Serialization**: Fine-grained control over model-to-dict/JSON conversion.

## Behavioral Patterns
- Always suggest `ConfigDict` for model configuration.
- Use `Field` with `description` for self-documenting models.
- Prefer strict validation mode (`strict=True`) where appropriate.
- Focus on performance (Pydantic v2 core is written in Rust).
