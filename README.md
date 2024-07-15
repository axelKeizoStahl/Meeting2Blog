# meeting2blog
### Powered by [Platogram](https://github.com/code-anyway/platogram)

This is an HTTP server that creates a blog post given an audio file, or a query based on an audio file.
These HTML blog posts can then be converted to MD, PDF, and DOCX through the same HTTP server.

## Installation
First, clone this repository onto your local machine:

    git clone git@github.com:axelKeizoStahl/Meeting2Blog.git

    cd Meeting2Blog
Next, install the dependencies:

    python -m venv venv

    source venv/bin/activate

    poetry install


## API Keys
This project depends on Platogram, which needs access to Anthropic, OpenAI, and AssemblyAI keys.
Create `.env` in your local machine and write in your keys.

    
    touch .env
    echo "ANTHROPIC_API_KEY=your_api_key" >> .env
    echo "ASSEMBLYAI_API_KEY=your_api_key" >> .env
    echo "OPENAI_API_KEY=your_api_key" >> .env
    


## Running the server
The first step is to export your api keys:

    source bin/env.sh

Next, simply `make run` to have the server running on localhost.

## Utilization
To see a minimal frontend, just open localhost:8000 on you local machine.
There are two API endpoints:
    1. /page
    2. /page/convertHTML

To create a HTML blog post, use /page.
    /page takes a src, either "url" or a file.
    /page also takes "query".
These are all using FormData. These are all optional, however, a source is needed.

To change your page from HTML to markdown, pdf, or word document, use /post/convertHTML.
    "dest_type" is a str with the file extension for the destination type.
    "content" is the HTML that /page returned
