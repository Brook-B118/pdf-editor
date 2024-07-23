import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import login_required, apology


app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False # This is setting the session to not be permanent, meaning it will end when the browser is closed.

app.config["SESSION_TYPE"] = "filesystem" # This is setting the session type to "filesystem". This means that session data will be stored on the server's file system. This is a simple and effective way to handle session data, but it wouldn't be suitable for a large-scale application. When you're running your application on a development server, the session data is stored on the file system of the machine where the server is running. This could be your local machine if you're running the server locally, or a remote server if you're running it there.

Session(app) # This is initializing the session with your Flask application. This is necessary for the session to work.

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///final_project.db")


# If you have a "remember me" feature on your site, you might set SESSION_PERMANENT to True for users who check that box. This would make their session survive even if they close their browser. However, you'd also need to set PERMANENT_SESSION_LIFETIME to specify how long the session should last.



@app.after_request
def after_request(response): # The @app.after_request part means this code runs after the server gets a request.
    # Ensure responses aren't cached (This part of the code is telling the browser not to remember (or "cache") any information from the server. This is done so that every time a user makes a request, they get the most up-to-date information from the server. Example: if you want to update number of users on your site, a cached webpage would show old information. Therefore this is common practice to ensure up to date information is displayed.)
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

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")

@app.route("/logout")
def logout():
    # Log user out

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():
    # Register user
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")
        # Validate that inputs are not empty when form is submitted
        if not username:
            return apology("Must provide username, 403")
        elif not password:
            return apology("Must provide password, 403")
        elif not confirmation:
            return apology("Must confirm password, 403")
        elif password != confirmation:
            return apology("Passwords do not match, 403")

        # Generate password hash
        password_hash = generate_password_hash(password)
        # Check if username already exists in database
        try:
            db.execute("INSERT INTO users (username, hash) VALUES(?, ?)", username, password_hash)
            flash("Registration successfull!")
        except ValueError:
            return apology("Username already exists", 400)

    else:
        return render_template("register.html")
    return render_template("/login.html")



# Runner and Debugger
if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
    # debug=True enables debug mode which provides more detailed error messages when something goes wrong. Also allows for "hot-reloading" which means the server will automatically update when making changes to the code. It is important to turn this off when the project is finished and we are ready to deploy.

    # debug=True was not working so using the unix command export FLASK_DEBUG=1 turns debugger on and unset FLASK_DEBUG turns it off.

    # Note: I finally got this line of code to work by moving it to the bottom of my code. I forgot this is where it needs to be.