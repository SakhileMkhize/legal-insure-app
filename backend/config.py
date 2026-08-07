from os import environ
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv(".env")


class Config:
    SQLALCHEMY_DATABASE_URI = environ.get("LOCAL_DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True

    JWT_SECRET_KEY = environ.get("SECRET_KEY")  # unique token
    JWT_TOKEN_LOCATION = ["headers"]  # where to sent token
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
