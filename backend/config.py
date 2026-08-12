from os import environ, path
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv(".env")

BASE_DIR = path.dirname(path.abspath(__file__))


class Config:
    SQLALCHEMY_DATABASE_URI = environ.get("LOCAL_DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True

    JWT_SECRET_KEY = environ.get("SECRET_KEY")  # unique token
    JWT_TOKEN_LOCATION = ["headers"]  # where to sent token
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)

    # Local-disk storage for claim evidence uploads (see claim_documents table)
    UPLOAD_FOLDER = environ.get(
        "UPLOAD_FOLDER", path.join(BASE_DIR, "uploads", "claims")
    )
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB per request
