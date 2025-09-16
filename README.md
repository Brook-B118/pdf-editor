# Flask PDF-Editor 

## This is a web-based document upload and editing tool built using Flask, SQLAlchemy, and WTForms. Users can register, log in, upload PDF files, and overlay editable elements such as text boxes onto their documents. Data is stored in a relational database.

## 🚀 Features

- User registration and login with password hashing
- CSRF protection and server-side session handling
- Secure file upload with MIME type checking
- Auto-saving of user-added elements to documents
- Multiple documents per user
- Document and account deletion
- Dockerized setup with named volumes for persistence (optional bind mounts for live code edits)
- Database migrations via Alembic/Flask-Migrate

---

## 📁 Folder Structure

```
project_root/
│
├── app.py # Main Flask app
├── models.py # SQLAlchemy database models
├── forms.py # WTForms classes
├── helpers.py # Login protection, error handling
├── file_handling.py # File upload + MIME verification logic
├── requirements.txt # Python package requirements
├── static/ # Uploaded files and CSS
└── templates/ # HTML templates (not included here)
```

---

## 🛠️ Setup Instructions

### Option 1: Local (no Docker)

1. **Get the code:**

```bash
git clone https://github.com/Brook-B118/pdf-editor.git
cd pdf-editor
```

2. **Create a virtual environment (optional but recommended):**

   ```bash
   python -m venv venv
   # macOS/Linux
   source venv/bin/activate
   # Windows:
   venv\Scripts\activate
   ```

3. **Install the dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Install the OS library for `python-magic`:**

   - macOS: `brew install file`
   - Ubuntu/Debian: `sudo apt-get update && sudo apt-get install -y libmagic1 file`
   - Windows: use the `python-magic-bin` package instead of `python-magic` (or install libmagic via a package manager)

5. **Create a `.env` file in the project root:**
   ```ini
   SECRET_KEY=your_secret_key_here
   DATABASE_URL=sqlite:///your_db_file.db
   # reCAPTCHA (Google-provided testing keys)
   RECAPTCHA_PUBLIC_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
   RECAPTCHA_PRIVATE_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
   ```
6. **Run the application**
   python app.py
7. **Visit the app in your browser at:**
   http://localhost:8000/

### Option 2: Docker

1. **Get the code:**

```bash
git clone https://github.com/Brook-B118/pdf-editor.git
cd pdf-editor
```

2. **Create a .env.dev file:**

```ini
FLASK_APP=app.py
SECRET_KEY=change-me
DATABASE_URL=sqlite:////app/instance/app.db
# reCAPTCHA (Google-provided testing keys)
RECAPTCHA_PUBLIC_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
RECAPTCHA_PRIVATE_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
```

3. **Build and start container:**

```bash
docker compose up --build
```

4. **Visit the app in your browser at:**
   http://localhost:8000

5. **Stop container:**

```bash
docker compose down
```

Note: If you changed directory ownership in the Dockerfile and need fresh volumes (this deletes DB/uploads/sessions stored in named volumes):

```bash
docker compose down --volumes
docker compose up --build
```
