import os
import magic
import bleach # Used to sanitize the user input before you use it in your application to prevent XSS (Cross-site scripting) attacks:


from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from helpers import login_required, apology
from models import db, Users, Document # Database models sheet
from forms import RegistrationForm, LoginForm, UploadForm
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
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
@login_required
def index():
    return apology("TODO")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # User reached route via POST (as by submitting a form via POST)
    form = LoginForm(request.form)
    if form.validate_on_submit(): # shortcut for if request.method == "POST" and form.validate():
        username = bleach.clean(form.username.data)
        password = bleach.clean(form.password.data)

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
        password = bleach.clean(form.password.data)
  
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

        # Save the file
        upload_folder = f'{user_id}_uploaded_files' # Creates the folder to send uploads to (this is local for now)

        if not os.path.exists(f'{user_id}_uploaded_files'):
            os.makedirs(f'{user_id}_uploaded_files')

        uploaded_file.save(os.path.join(upload_folder, uploaded_filename)) # uploaded_file is the actual file and we are saving it in the folder AS the secure filename stored in filename.

        # Check the MIME type of the file
        mime = magic.from_file(os.path.join(upload_folder, uploaded_filename), mime=True) # This returns the "MIME" of the file, the MIME for pdfs is 'application/pdf'. To see the MIME for other files you have to search it up.
        if mime in ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            # The file is a PDF or Word doc, add to Sqlite3 using SQLAlchemy
            new_document = Document(user_id=session['user_id'], filename=uploaded_filename, file_path=os.path.join(upload_folder, uploaded_filename)) 
              
            db.session.add(new_document)  

            try:
                db.session.commit()
                flash("Upload successful!")
            except SQLAlchemyError as e:
                print(e)
                return apology("An error occurred while uploading the document.", 400)

            document = Document.query.filter_by(filename=uploaded_filename).first()
            if document:
                session['filename'] = document.id
            else: 
                return apology("No file in session", 400)
            return redirect(f"/documents/edit/{session['filename']}")
        
        else:
            # The file is not a PDF or Word doc
            return apology("file is not a pdf or doc", 403)
    else:
        return render_template("documents.html", form=form)




@app.route("/documents/edit/<int:doc_id>", methods=["GET", "POST"])
@login_required
def editDocument(doc_id):
    document = Document.query.get(doc_id)
    # Now you can use document.id, document.filename, etc.
    if request.method == "POST":
        return apology("TODO", 403)
    
    else:
        filename = document.filename
        if filename:
            # Continue
            return render_template("/editDocument.html")
        else:
            return apology("filename is None", 403)
    





# Runner and Debugger
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', debug=True)
    # debug=True enables debug mode which provides more detailed error messages when something goes wrong. Also allows for "hot-reloading" which means the server will automatically update when making changes to the code. It is important to turn this off when the project is finished and we are ready to deploy.

    # debug=True was not working so using the unix command export FLASK_DEBUG=1 turns debugger on and unset FLASK_DEBUG turns it off.

    # Note: I finally got this line of code to work by moving it to the bottom of my code. I forgot this is where it needs to be.