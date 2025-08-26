import os
import magic
import bleach 
import secrets 

from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError
from flask import Flask, flash, redirect, render_template, request, session, jsonify, url_for, g
from flask_session import Session
from flask_wtf.csrf import CSRFProtect 

from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from helpers import login_required, apology
from models import db, Users, Document, Element 
from forms import RegistrationForm, LoginForm, UploadForm, DeleteAccountForm
from dotenv import load_dotenv
import shutil
from file_handling import save_temp_file, check_temp_file_mime, add_file_to_db

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
csrf = CSRFProtect(app)
app.config['RECAPTCHA_PUBLIC_KEY'] = os.getenv('RECAPTCHA_PUBLIC_KEY')
app.config['RECAPTCHA_PRIVATE_KEY'] = os.getenv('RECAPTCHA_PRIVATE_KEY')
app.config['TESTING'] = True 
app.config["SESSION_PERMANENT"] = False 
app.config["SESSION_TYPE"] = "filesystem" 

Session(app) 


# Configure SQL ALchemy
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  
db.init_app(app)

@app.before_request
# before_request runs its functions before every single incoming HTTP request, no matter what route is being accessed. For example, when the user opens "/", set_nonce() runs first. Then when they POST to "/login", it runs again.
def set_nonce():
    g.csp_nonce = secrets.token_urlsafe(16)

@app.after_request
def after_request(response): 
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate" 

    response.headers["Expires"] = 0 

    response.headers["Pragma"] = "no-cache" 

    # Security Headers:

    # HSTS should only be enabled in production

    nonce = getattr(g, "csp_nonce", "")
    # getattr() is a built-in Python function that tries to access an attribute of an object and returns a default value if it doesn't exist. The third argument is an empty string to say "Try to get g.csp_nonce. If it doesn't exist, return an empty string instead of crashing with an AttributeError."
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'nonce-{nonce}' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; "
        "worker-src 'self' blob: https://unpkg.com; "
        "style-src 'self' https://cdn.jsdelivr.net https://unpkg.com; "
        "font-src 'self' https://unpkg.com; "
        "object-src 'none';"
    ).format(nonce=nonce)

    response.headers["Content-Security-Policy"] = csp_policy


    return response 

@app.route("/")
def index():
    return render_template("home.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    form = LoginForm(request.form)
    if form.validate_on_submit(): 
        username = bleach.clean(form.username.data)
        password = form.password.data

        user = Users.query.filter_by(username=username).first() 

        if user is None or not check_password_hash(user.hash, password):
            return apology("invalid username and/or password", 403)

        session.clear()

        session["user_id"] = user.id 

        return redirect("/")
    else:
        for field, errors in form.errors.items():
            for error in errors:
                return apology(f"Error in {field}: {error}", 400)
        return render_template("login.html", form=form)

@app.route("/logout")
@login_required
def logout():
    # Log user out

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():
    # Register user
    form = RegistrationForm(request.form)
    if form.validate_on_submit(): # shortcut for if request.method == "POST" and form.validate():
        username = bleach.clean(form.username.data)
        password = form.password.data
  
        # Check if username already exists in database
        user = Users.query.filter_by(username=username).first()
        if user:
            return apology("Username already exists", 400)
        
        try:
            # Create new user
            new_user = Users(username=username, hash=generate_password_hash(password))

            # Add new user to session
            db.session.add(new_user)

            # Commit session to save changes
            db.session.commit()
        except (IntegrityError, DataError) as e:
            print(e)
            db.session.rollback()
            return apology("Error entering user into database", 400)
        except Exception as e:
            print(f"Exception error: {e}")
            return apology("An unexpected error occurred", 500)

    else:
        for field, errors in form.errors.items():
            for error in errors:
                return apology(f"Error in {field}: {error}", 400)
        return render_template("register.html", form=form)
    return redirect("/login")


@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    form = DeleteAccountForm(request.form)
    if form.validate_on_submit():
        user_id = session['user_id']
        user = Users.query.filter_by(id=user_id).first()

        existing_documents = Document.query.filter_by(user_id=user_id).all()
        existing_elements = Element.query.filter_by(user_id=user_id).all()

        if user:
            for element in existing_elements:
                db.session.delete(element)
            for document in existing_documents:
                db.session.delete(document)
            db.session.delete(user)
            try:
                db.session.commit()
                shutil.rmtree(f'static/uploaded_files/{user_id}')
                logout()
                return redirect(url_for('register')) 
            except SQLAlchemyError as e:
                print(e)
                db.session.rollback()
    else:
        return render_template("profile.html", form=form)



@app.route("/uploadDocuments", methods=["GET", "POST"])
@login_required
def upload_documents():

    # File Upload: Flask has a request.files object that you can use to access uploaded files. You can use the werkzeug.utils.secure_filename() function to ensure the filename is safe.
    form = UploadForm()
    # Get the uploaded file (request.files.get returns a FileStorage object, not a file name.)
    if form.validate_on_submit():
        user_id = session['user_id']
        uploaded_file = form.file.data

        # Ensure the filename is safe:
        uploaded_filename = secure_filename(uploaded_file.filename)
        hex_filename = secrets.token_hex(16)

        file_info = {
            "user_id": user_id,
            "uploaded_file": uploaded_file,
            "hex_filename": hex_filename,
            "uploaded_filename": uploaded_filename
        }

        # Temporarily save the file
        save_temp_file(file_info)

        # Make sure file is a PDF or a word doc
        mime_check = check_temp_file_mime(file_info)

        if mime_check:

            # Add file to database
            add_file_to_db(file_info)

            document = Document.query.filter_by(filename=hex_filename).first()
            if document:
                session['doc_id'] = document.filename
            else: 
                return apology("No file in session", 400)
            return redirect(url_for('editDocument', hex_filename=document.filename))
            
        else:
            return apology("file is not a pdf or doc", 403)
    else:
        userDocuments = Document.query.filter_by(user_id=session['user_id']).all()
        return render_template("documents.html", form=form, files=userDocuments)
        

@app.route("/documents/edit/<hex_filename>", methods=["GET", "POST"])
@login_required
def editDocument(hex_filename):
    document = Document.query.filter_by(filename=hex_filename).first()
    print(document.edited_filename)
    if document:
        user_id = document.user_id
    else:
        return apology("document is None", 403)
    # Now you can use document.id, document.filename, etc.
    if request.method == "POST": # do not need this im pretty sure
        return apology("TODO", 403) 
    
    else:
        if session['user_id'] == user_id: 
            return render_template('editDocument.html', document=document, folder=user_id)
        else:
            logout()
            return redirect(url_for('register')) 
    

@app.route('/remove/<filename>', methods=['POST'])
@login_required
def remove_file(filename):
    document = Document.query.filter_by(filename=filename).first()
    if document and document.user_id == session['user_id']:
        document_id = document.id
        elements = Element.query.filter_by(document_id=document_id)

        elements.delete()  # Delete all elements associated with the document
        db.session.delete(document) # Delete the document itself
        db.session.commit()
        
        os.remove(f'static/uploaded_files/{document.user_id}/{filename}.pdf')
        return jsonify(success=True)
    return jsonify(success=False)


@app.route('/remove_element', methods=['POST'])
@login_required
def remove_element():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
    
    # Extract the data from request and session
    user_id = session['user_id']
    document_id = data['document_id']
    element_id = data['element_id']

    if not document_id or not element_id:
        print("Invalid document_id or element_id")

    # Check if element exists in db
    target_element = Element.query.filter_by(user_id=user_id, document_id=document_id, element_id=element_id).first()

    if target_element:
        db.session.delete(target_element)
        try:
            db.session.commit()
            return jsonify({"success": True}), 200 
        except SQLAlchemyError as e:
            print(e)
            db.session.rollback()
            return jsonify({"error": "Database error"}), 500
    else:
        return jsonify({"error": "Database error"}), 500
      

@app.route('/autosave', methods=['POST'])
@login_required
def autosave_elements():
    print("Autosave endpoint hit")  # Debugging line

    data = request.get_json()

    if not data:
        print("No data received")
        return jsonify({"error": "Invalid JSON"}), 400
    
    print("Received data:", data)  # Debugging line

    # Extract data from the request
    user_id = session['user_id']  # Get user ID from session
    document_id = data['document_id']

    document = Document.query.filter_by(id=document_id, user_id=session['user_id']).first()
    if not document:
        return jsonify({"error": "Unauthorized"}), 403

    elements = data['changes']

    if not document_id or not isinstance(elements, list):
        print("Invalid document_id or changes")
        return jsonify({"error": "Invalid data format"}), 400

    for element in elements:
        print("Processing element:", element)  # Debugging line

        element_id = element['element_id']
        print(f"element_id being saved: {element_id}")
        type = element['type']
        content = bleach.clean(element['content'])
        width = element['element_width']
        height = element['element_height']
        position_x = element['position_x']
        position_y = element['position_y']
        overlayId = element['overlayId']
        background_color = element['background_color']
        border_color = element['border_color']
        font_family = element['font_family']
        font_size = element['font_size']
    
        if not all([element_id, type, position_x, position_y, overlayId]):
                print("Incomplete element data")
                continue

   
        # Check if the element already exists
        existing_elements = Element.query.filter_by(user_id=user_id, document_id=document_id).all()
        print(f"existing elements: {existing_elements}")
        element_found = False 

        for existing_element in existing_elements:
            print(f"Checking element: {existing_element.element_id}")
            if existing_element.element_id == element_id:
                print(f"existing element found: {existing_element}")
                # Update the element
                existing_element.type = type
                existing_element.content = content
                existing_element.width = width
                existing_element.height = height
                existing_element.position_x = position_x
                existing_element.position_y = position_y
                existing_element.overlayId = overlayId
                existing_element.background_color = background_color
                existing_element.border_color = border_color
                existing_element.font_family = font_family
                existing_element.font_size = font_size
                element_found = True
                break
        
        if element_found:
            if isinstance(existing_element, Element):
                db.session.add(existing_element) # db.session.add can be thought about as staging a change to the db without fully finallizing it (committing). The changes are only finalized once db.session.commit is called. 
                # This is good for making multiple changes and then committing them all at once.
        else:
            print("No existing element found, creating a new one.")
            new_element = Element(user_id=user_id, document_id=document_id, element_id=element_id, type=type, content=content, width=width, height=height, position_x=position_x, position_y=position_y, overlayId=overlayId, background_color=background_color, border_color=border_color, font_family=font_family, font_size=font_size)
            if isinstance(new_element, Element):
                db.session.add(new_element)

    try:
        db.session.commit()
    except SQLAlchemyError as e:
        print(e)
        db.session.rollback()
        return jsonify({"error": "Database error"}), 500

    return jsonify({"success": True}), 200


@app.route('/get_changes', methods=['GET'])
@login_required
def get_changes():
    document_id = request.args.get('document_id')
    user_id = session['user_id']
    
    changes = Element.query.filter_by(document_id=document_id, user_id=user_id).all()
    changes_data = [{
        'element_id': change.element_id,
        'type': change.type,
        'content': change.content,
        'width': change.width,
        'height': change.height,
        'position_x': change.position_x,
        'position_y': change.position_y,
        'overlayId': change.overlayId,
        'background_color': change.background_color,
        'border_color': change.border_color,
        'font_family': change.font_family,
        'font_size': change.font_size,
    } for change in changes]
    
    return jsonify({'changes': changes_data})

@app.route('/update-filename', methods=['POST'])
@login_required
def update_filename():
    data=request.get_json()
    document_id = data['document_id']
    new_filename = data['filename']

    document = Document.query.filter_by(id=document_id).first()
    if document and document.user_id == session['user_id']:
        document.edited_filename = new_filename
        try:
            db.session.commit()
            return jsonify({"status": "success"}), 200
        except SQLAlchemyError as e:
            print(e)
            db.session.rollback()
            return jsonify({"error": "Database error"}), 500
    elif document.user_id != session['user_id']:
        logout()
        return jsonify({"error": "Unauthorized"}), 403
    else:
        return jsonify({"error": "Document not found"}), 403


# Runner and Debugger
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', debug=True)
    # debug=True enables debug mode which provides more detailed error messages when something goes wrong. Also allows for "hot-reloading" which means the server will automatically update when making changes to the code. It is important to turn this off when the project is finished and we are ready to deploy.

    # debug=True was not working so using the unix command export FLASK_DEBUG=1 turns debugger on and unset FLASK_DEBUG turns it off.

    # Note: I finally got this line of code to work by moving it to the bottom of my code. I forgot this is where it needs to be.