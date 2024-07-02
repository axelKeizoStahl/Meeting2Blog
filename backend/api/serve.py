from flask import Flask

app = Flask(__name__)

@app.route('/')
def home() -> str:
    body = '''<h1>Meeting to Blog!</h1>
    <h3>Powered by Platogram (https://github.com/code-anyway/platogram)</h3>
    <p>Given an audio recording (of a meeting), generate a blog post</p>
    '''
    return body

@app.route('/post/<int:post_id>')
def post(post_id):
    ...
