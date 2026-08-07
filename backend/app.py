from flask import Flask
from routes.users_bp import users_bp
from routes.policies_bp import policies_bp
from routes.claims_bp import claims_bp
from routes.consultations_bp import consultations_bp
from routes.admin_bp import admin_bp
from config import Config
from extensions import db, jwt
from sqlalchemy.sql import text
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
jwt.init_app(app)  # JWT - JSON Web Token

with app.app_context():
    try:
        result = db.session.execute(text("SELECT 1")).fetchall()
        print("Connection successful:", result)
    except Exception as e:
        print("Error connecting to the database.")


@app.route("/")
def hello():
    return "<h1>Hello, World!</h1>"


app.register_blueprint(users_bp, url_prefix="/api/auth/")
app.register_blueprint(policies_bp, url_prefix="/api/policies/")
app.register_blueprint(claims_bp, url_prefix="/api/claims/")
app.register_blueprint(consultations_bp, url_prefix="/api/consultations/")
app.register_blueprint(admin_bp, url_prefix="/api/admin/")
