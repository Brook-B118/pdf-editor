from flask_wtf import FlaskForm # a separate package that provides additional functionality for working with forms in Flask, including CSRF protection.
from wtforms import Form, StringField, PasswordField, SubmitField, validators # Can use FileField for uploading files!
from flask_wtf.recaptcha import RecaptchaField

class RegistrationForm(FlaskForm):
    username = StringField('Username', [validators.Length(min=4, max=25)])
    password = PasswordField('Password', [
        validators.DataRequired(),
        validators.EqualTo('confirm', message='Passwords must match')
    ])
    confirm = PasswordField('Confirm Password', [validators.DataRequired()])
    submit = SubmitField('Submit')
    recaptcha = RecaptchaField()

class LoginForm(FlaskForm):
    username = StringField("Username", [validators.DataRequired()])
    password = PasswordField("Password", [validators.DataRequired()])
    submit = SubmitField('Submit')