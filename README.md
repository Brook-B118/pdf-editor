# Flask Document Editor

This is a web-based document upload and editing tool built using Flask, SQLAlchemy, and WTForms. Users can register, log in, upload PDF files, and overlay editable elements such as text boxes onto their documents. All user and document data is stored securely in a relational database.

---

## 🚀 Features

- User registration and login with password hashing
- CSRF protection and server-side session handling
- Secure file upload with MIME type checking
- Auto-saving of user-added elements to documents
- Support for multiple users and document ownership
- Document deletion and account removal

---

## 📁 Folder Structure

```
project_root/
│
├── app.py # Main Flask app
├── models.py # SQLAlchemy database models
├── forms.py # WTForms classes
├── helpers.py # Login protection, error handling
├── file_handling.py # File upload and verification logic
├── database_queries.sql # Sample schema creation
├── requirements.txt # Python package requirements
├── static/ # Uploaded files and CSS
├── templates/ # HTML templates (not included here)
└── .gitignore # Prevents sensitive files from being committed
```

---

## 🛠️ Setup Instructions

1. **Create a virtual environment (optional but recommended):**

   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```

2. **Install the dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Create a `.env` file in the project root:**
   ```ini
   SECRET_KEY=your_secret_key_here
   DATABASE_URL=sqlite:///your_db_file.db
   RECAPTCHA_PUBLIC_KEY=your_recaptcha_pub
   RECAPTCHA_PRIVATE_KEY=your_recaptcha_priv
   ```
4. **Run the application**
   python app.py
5. **Visit the app in your browser at:**
   http://localhost:5000/
