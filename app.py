from flask import Flask, redirect, render_template

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("home.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0') 
    # debug=True enables debug mode which provides more detailed error messages when something goes wrong. Also allows for "hot-reloading" which means the server will automatically update when making changes to the code. It is important to turn this off when the project is finished and we are ready to deploy.

    # debug=True was not working so using the unix command export FLASK_DEBUG=1 turns debugger on and unset FLASK_DEBUG turns it off.

