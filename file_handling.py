import os
import magic
import shutil

from sqlalchemy.exc import SQLAlchemyError
from models import db, Document # Database models sheet
from helpers import apology
from flask import flash


def save_temp_file(file_info):

    # file info variables needed:
    user_id = file_info["user_id"]
    uploaded_file = file_info["uploaded_file"]
    hex_filename = file_info["hex_filename"]

    # Temporarily save the file
    temp_upload_folder = (f'static/temp_uploaded_files/{user_id}') # Creates the folder to send uploads to (this is local for now)

    if not os.path.exists(f'static/temp_uploaded_files/{user_id}'):
        os.makedirs(f'static/temp_uploaded_files/{user_id}')

    uploaded_file.save(os.path.join(temp_upload_folder, hex_filename  + '.pdf')) # uploaded_file is the actual file and we are saving it in the folder AS the secure filename stored in filename.

    temp_file_location = (os.path.join(temp_upload_folder, hex_filename + '.pdf'))

    file_info["temp_file_location"] = temp_file_location

def check_temp_file_mime(file_info):

    # file info variables needed:
    user_id = file_info["user_id"]
    hex_filename = file_info["hex_filename"]
    temp_file_location = file_info["temp_file_location"]


    temp_upload_folder = (f'static/temp_uploaded_files/{user_id}')

    # Check the MIME type of the file
    mime = magic.from_file(os.path.join(temp_file_location), mime=True) # This returns the "MIME" of the file, the MIME for pdfs is 'application/pdf'. To see the MIME for other files you have to search it up.

    if mime in ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
        # The file is a PDF or Word doc
        # Officially save the file, first create official folder then move file to folder.
        upload_folder = (f'static/uploaded_files/{user_id}') # Creates the folder to send uploads to (this is local for now)

        if not os.path.exists(f'static/uploaded_files/{user_id}'):
            os.makedirs(f'static/uploaded_files/{user_id}')
        
        shutil.move(temp_file_location, os.path.join(upload_folder, hex_filename + '.pdf'))

        file_info["upload_folder"] = upload_folder
        file_info["uploaded_file_location"] = os.path.join(upload_folder, hex_filename + '.pdf')


        # Delete temp folder
        shutil.rmtree(temp_upload_folder)
        return True
    else:
        # The file is not a PDF or Word doc
        os.remove(temp_file_location)
        shutil.rmtree(temp_upload_folder)
        return False
    


def add_file_to_db(file_info):

    # file info variables needed:
    user_id = file_info["user_id"]
    hex_filename = file_info["hex_filename"]
    uploaded_file_location = file_info["uploaded_file_location"]
    uploaded_filename = file_info["uploaded_filename"]

    new_document = Document(user_id=user_id, filename=hex_filename, file_path=uploaded_file_location, edited_filename=uploaded_filename) 
        
    db.session.add(new_document)  

    try:
        db.session.commit()
        flash("Upload successful!")
    except SQLAlchemyError as e:
        print(e)
        return apology("An error occurred while uploading the document.", 400)    

