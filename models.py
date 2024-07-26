
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy() # Creates instance of the SQLAlchemy class. This instance, db, is what you use to interact with your database. It's like a bridge between your Python code and your database.

# However, when you create this instance, it doesn't know anything about your Flask app yet. That's where db.init_app(app) comes in.

# In app.py, the line db.init_app(app) is telling the db instance about your Flask app. It's like you're saying, "Hey, db, this is the Flask app I want you to work with."


 # Database Class Model (Create tables through this, a model represents a single row in the table)

class Users(db.Model): # Creates a table of the lower case class name by default. If you want to create a new user you are creating a new Users object which will create a new row.
    # Class Variables
    id = db.Column(db.Integer, primary_key=True) # Because this has an integer and primary key, it will automatically have auto increment.)
    username = db.Column(db.String(25), unique=True, nullable=False)
    hash = db.Column(db.String(150), nullable=False)