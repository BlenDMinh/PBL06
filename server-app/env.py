from dotenv import dotenv_values

config = dotenv_values(".env")

import os

# Override .env values with OS environment variables if they exist
config = {key: os.getenv(key, default=value) for key, value in config.items()}

if __name__ == "__main__":
    # Clear all environment variables that exists in .env
    for key in config.keys():
        os.environ.pop(key, None)

    config = dotenv_values(".env")

    import os

    # Override .env values with OS environment variables if they exist
    config = {key: os.getenv(key, default=value) for key, value in config.items()}
    
    print(config)