import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import login_required, apology


app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
# db = SQL("sqlite:///finance.db")

@app.route("/")
@login_required
def index():
    return apology("TODO")

# if __name__ == "__main__":
#     app.run(host='0.0.0.0') 
    # debug=True enables debug mode which provides more detailed error messages when something goes wrong. Also allows for "hot-reloading" which means the server will automatically update when making changes to the code. It is important to turn this off when the project is finished and we are ready to deploy.

    # debug=True was not working so using the unix command export FLASK_DEBUG=1 turns debugger on and unset FLASK_DEBUG turns it off.

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
        # rows = db.execute(
        #     "SELECT * FROM users WHERE username = ?", request.form.get("username")
        # )

        # Ensure username exists and password is correct
        # if len(rows) != 1 or not check_password_hash(
        #     rows[0]["hash"], request.form.get("password")
        # ):
        #     return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        # session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")
