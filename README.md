# meeting2blog
### Powered by [Platogram](https://github.com/code-anyway/platogram)

This is an HTTP server that creates a blog post given an audio file, or a query based on an audio file.
These HTML blog posts can then be converted to MD, PDF, and DOCX through the same HTTP server.

## Installation
First, clone this repository onto your local machine:

    git clone https://github.com/axelKeizoStahl/Meeting2Blog.git

    cd Meeting2Blog
Next, install the dependencies:

    poetry install

Then, enter the poetry venv:

    poetry shell

## Running the Server
The first step is to export your api keys:

    source bin/env.sh

Next, simply `make run` to have the server running on localhost.

## Utilization
To see a minimal frontend, just open localhost:8000 on you local machine.
There are two API endpoints:
    1. /page
    2. /page/convertHTML

To create a HTML blog post, use /page.
    /page takes a src, either comma-separated url's under "url" and/or a list of files under "file".
    /page also takes "query".
These are all using FormData. While these are all optional, at least one source is needed.

To change your page from HTML to markdown, pdf, or word document, use /post/convertHTML.
    "dest_type" is a str with the file extension for the destination type.
    "content" is the HTML that /page returned
