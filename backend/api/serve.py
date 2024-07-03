from flask import Flask

app = Flask(__name__)

"""
TODO

This folder should just return a post given a url (file later) in a POST request
Move all code that is note this (storing posts, quering posts, home pages) to application folder.
*Consider moving this api into platogram's examples, this repo can be the front end app.*
"""

@app.route("/")
def home() -> str:
    body = """<h1>Meeting to Blog!</h1>
        <h3>Powered by Platogram (https://github.com/code-anyway/platogram)</h3>
        <p>Given an audio recording (of a meeting), generate a blog post</p>
    """
    return body

@app.route("/post/<int:post_id>")
def post(post_id: int) -> str:
    with open(f"posts/{post_id}", "r") as post_body:
        body = post_body.read()
        return body

@app.route("/query/<int:post_id>")
def refine_post(post_id: int, query: str) -> str:
    ...
