import os
import magic
import bleach # Used to sanitize the user input before you use it in your application to prevent XSS (Cross-site scripting) attacks:
import secrets # Used to generate a text string in hexadecimal

from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError
# from sqlalchemy.orm import sessionmaker
from flask import Flask, flash, redirect, render_template, request, session, jsonify, url_for
from flask_session import Session
from flask_wtf.csrf import CSRFProtect # To initialize CSRF protection for app

from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from helpers import login_required, apology
from models import db, Users, Document, Element # Database models sheet
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
app.config['TESTING'] = True # Let's flask_wtf know that I am testing my app (not running in a development env) so I don't have to submit the recaptcha everytime

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False # This is setting the session to not be permanent, meaning it will end when the browser is closed.

app.config["SESSION_TYPE"] = "filesystem" # This is setting the session type to "filesystem". This means that session data will be stored on the server's file system. This is a simple and effective way to handle session data, but it wouldn't be suitable for a large-scale application. When you're running your application on a development server, the session data is stored on the file system of the machine where the server is running. This could be your local machine if you're running the server locally, or a remote server if you're running it there.


Session(app) # This is initializing the session with your Flask application. This is necessary for the session to work.


# Configure SQL ALchemy
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False # This is just so if you change for example a user's email in user database, sql alchemy won't track this and send a signal saying "users email was changed". The email will still be updated, there just wont be a signal for it. Turning this to True is resource intensive and generally it is a good idea to keep this off. 
db.init_app(app)
# db = SQL("sqlite:///final_project.db")

# If you have a "remember me" feature on your site, you might set SESSION_PERMANENT to True for users who check that box. This would make their session survive even if they close their browser. However, you'd also need to set PERMANENT_SESSION_LIFETIME to specify how long the session should last.



@app.after_request
def after_request(response): # The @app.after_request part means this code runs after the server gets a request.
    # Ensure responses aren't cached 
    # (This part of the code is telling the browser not to remember (or "cache") any information from the server. This is done so that every time a user makes a request, they get the most up-to-date information from the server. Example: if you want to update number of users on your site, a cached webpage would show old information. Therefore this is common practice to ensure up to date information is displayed.)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate" # tells the client's browser not to cache the response, not to store it, and to validate it every time before using it.

    response.headers["Expires"] = 0 # tells the browser that the response is already expired and should not be cached

    response.headers["Pragma"] = "no-cache" # This is an older directive to prevent caching, mostly for older HTTP 1.0 servers.

    # The response.headers lines are instructions to the browser. They all say in different ways, "Don't remember this information for next time."

    return response # return response sends these instructions back to the browser.

@app.route("/")
def index():
    return render_template("home.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # User reached route via POST (as by submitting a form via POST)
    form = LoginForm(request.form)
    if form.validate_on_submit(): # shortcut for if request.method == "POST" and form.validate():
        username = bleach.clean(form.username.data)
        password = form.password.data

        # Query database for username
        user = Users.query.filter_by(username=username).first() # SQL Alchemy: This will return the first Users object (i.e., row from the users table) where the username matches the username from the form.
        # Then, you can access the hash and id attributes of the user object directly, like user.hash and user.id.

        # Ensure username exists and password is correct
        if user is None or not check_password_hash(user.hash, password):
            return apology("invalid username and/or password", 403)
        # In this case, user is not a list or a result set like rows was. It's a single instance of the Users class (representing a single row from the users table) or None. So, you can't use len(user) because user isn't a collection of items. Instead, you can simply check if user is None to see if a user was found.

         # Forget any user_id
        session.clear()

        # Remember which user has logged in
        session["user_id"] = user.id 

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
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
        


# @app.route("/doc_name/<hex_filename>")
# @login_required
# def docName(doc_id):
#     document = Document.query.get(doc_id)
#     filename = document.filename
#     return jsonify(filename=filename)


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
        return apology("TODO", 403) # do not need
    
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