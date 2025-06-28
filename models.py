from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
# from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
# from sqlalchemy.ext.declarative import declarative_base

db = SQLAlchemy() # Creates instance of the SQLAlchemy class. This instance, db, is what you use to interact with your database. It's like a bridge between your Python code and your database.

# However, when you create this instance, it doesn't know anything about your Flask app yet. That's where db.init_app(app) comes in.

# In app.py, the line db.init_app(app) is telling the db instance about your Flask app. It's like you're saying, "Hey, db, this is the Flask app I want you to work with."


 # Database Class Model (Create tables through this, a model represents a single row in the table)

class Users(db.Model): # Creates a table of the lower case class name by default. If you want to create a new user you are creating a new Users object which will create a new row.
    # Class Variables
    id = db.Column(db.Integer, primary_key=True) # Because this has an integer and primary key, it will automatically have auto increment.)
    username = db.Column(db.String(25), unique=True, nullable=False)
    hash = db.Column(db.String(150), nullable=False)


class Document(db.Model):
    __tablename__ = 'documents' # Optional to add tablename, SQLAclhemy by default will take the lowercase class name and use that as the tablename.
    id = db.Column(db.Integer, primary_key=True)
    upload_time = db.Column(db.DateTime, default=db.func.current_timestamp()) # The default part is for when we do not provide an upload time when creating a new row. It will automatically use the current timestamp.
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    filename = db.Column(db.String(255), unique=True, nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    edited_filename = db.Column(db.String(255))

# The previous models were created using the flask specific SQLAlchemy approach, we will now be creating tables for autosaving but using general SQLAlchemy

# Base = declarative_base()

# class Element(Base):
#     __tablename__ = 'elements'
#     id = Column(Integer, primary_key=True)
#     timestamp = Column(DateTime, default=func.now(), nullable=False)
#     user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
#     document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
#     element_id = Column(String, nullable=False)
#     type = Column(String, nullable=False)  # e.g., 'textbox', 'image', etc.
#     content = Column(String)  # Store content based on type
#     position_x = Column(Float, nullable=False)
#     position_y = Column(Float, nullable=False)
#     overlayId = Column(String, nullable=False)

# Apparently it is actually a bad idea to mix up ORM systems, it can lead to complications later. I am going to stick to db.Model for now.

class Element(db.Model):
    __tablename__ = 'elements'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=db.func.now(), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=False)
    element_id = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)  # e.g., 'textbox', 'image', etc.
    content = db.Column(db.String)  # Store content based on type
    width = db.Column(db.Float, nullable=False)  # Add width
    height = db.Column(db.Float, nullable=False)  # Add height
    position_x = db.Column(db.Float, nullable=False)
    position_y = db.Column(db.Float, nullable=False)
    overlayId = db.Column(db.String, nullable=False)
    background_color = db.Column(db.String, nullable=True)
    border_color = db.Column(db.String, nullable=True)
    font_family = db.Column(db.String, nullable=True)
    font_size = db.Column(db.Integer, nullable=True)


def update_timestamp(mapper, connection, target):
    target.timestamp = db.func.now()

event.listen(Element, 'before_update', update_timestamp)