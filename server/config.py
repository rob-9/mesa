"""runtime settings loaded from .env via pydantic-settings.
single source of truth for database url, log level, and any future env-driven
config. accessed everywhere through `get_settings()` so the values are read
once and cached for the process lifetime.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg://summer:summer@localhost:5432/summer"
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
