from flask import Flask
from routes.users_bp import users_bp
from routes.policies_bp import policies_bp
from routes.claims_bp import claims_bp
from routes.consultations_bp import consultations_bp
from routes.partners_bp import partners_bp
from routes.admin_bp import admin_bp
from config import Config
from extensions import db, jwt
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
jwt.init_app(app)


@app.route("/")
def hello():
    return "<h1>Legal Insure API</h1>"

@app.route("/health")
def health():
    return {"status": "ok"}, 200


app.register_blueprint(users_bp, url_prefix="/api/auth/")
app.register_blueprint(policies_bp, url_prefix="/api/policies/")
app.register_blueprint(claims_bp, url_prefix="/api/claims/")
app.register_blueprint(consultations_bp, url_prefix="/api/consultations/")
app.register_blueprint(partners_bp, url_prefix="/api/partners/")
app.register_blueprint(admin_bp, url_prefix="/api/admin/")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
