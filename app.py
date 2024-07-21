from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, world!</p>"

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True) 
    # debug=True enables debug mode which provides more detailed error messages when something goes wrong. Also allows for "hot-reloading" which means the server will automatically update when making changes to the code. It is important to turn this off when the project is finished and we are ready to deploy.

    