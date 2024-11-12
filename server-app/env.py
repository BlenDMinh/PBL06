import logging
from dotenv import dotenv_values

env_keys = [
    # Host config
    "MYSQL_DB_HOST",
    "MYSQL_DB_PORT",
    "SERVER_APP_HOST",
    "SERVER_APP_PORT",
    "SERVER_AI_HOST",
    "SERVER_AI_PORT",
    "APP_ENV",

    # MySQL Database env
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE",
    "DATABASE_URL",

    # Nextjs env
    "LOCAL_API_URL",
    "JWT_SECRET",
    "PING_INTERVAL",
    "ACCESS_TOKEN_EXPI",
    "REFRESH_TOKEN_EXPI",

    # FastAPI AI env
    "GIT_MODEL_NAME",
    "GIT_MODEL_PATH",
    "GIT_PARAM_PATH",
    "SERVER_AI_DATABASE_ECHO",

    # For Hugging-face
    "HF_HOME",

    # FastAPI Server env
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
]

config = dotenv_values(".env")

import os

# Override .env values with OS environment variables if they exist
config = {key: os.getenv(key, default=config.get(key, "")) for key in env_keys}

logging.info(f"Config: {config}")

if __name__ == "__main__":
    # Clear all environment variables that exists in .env
    for key in config.keys():
        os.environ.pop(key, None)

    config = dotenv_values(".env")

    import os

    # Override .env values with OS environment variables if they exist
    config = {key: os.getenv(key, default=config.get(key, "")) for key in env_keys}
    
    print(config)