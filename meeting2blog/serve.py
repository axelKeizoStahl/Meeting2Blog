from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, StreamingResponse
import logging
from .response import content_to_html, extract_html, HTML_to_format
from .synthesize import summarize_audio, prompt_content
from tarfile import TarFile
from tempfile import TemporaryDirectory, SpooledTemporaryFile
from typing import List


app = FastAPI()
logger = logging.getLogger(__name__)


def get_src(
    urls: str | None = Form(None), files: List[UploadFile] | None = File(None)
) -> List[str | SpooledTemporaryFile]:
    sources = []

    if files is not None:
        sources = [file for file in files]
    if urls is not None:
        sources += [url for url in urls.split(",")]
    if sources == []:
        raise HTTPException(status_code=400, detail="No URL or file found in request")
    return sources


@app.get("/")
async def redirect_to_home():
    return RedirectResponse(url="/home")


app.mount("/home", StaticFiles(directory="public", html=True), name="static")


@app.post("/post")
async def generate_post(
    url: str | None = Form(None),
    file: List(UploadFile) | None = File(None),
    prompt: str | None = Form(None)
) -> dict:
    try:
        sources = get_src(url, file)

        if prompt is not None:
            content = [await summarize_audio(src) for src in sources]

            response = await prompt_content(content, prompt)

            prompt = f"return only html to acuratelly represent a blog post on the following text:\n{response}"
            response = await prompt_content(content, prompt)

            html_content = extract_html(response)
        else:
            src = sources[0]
            content = await summarize_audio(src)

            html_content = content_to_html(content)

        return {"html": html_content}
    except Exception as e:
        logger.error(e)
        raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/post/convertHTML")
async def convert_HTML(
        content: str = Form(...),
        dest_type: str = Form(...)
) -> dict:
    async def result_generator():
        converted_result = HTML_to_format(content, dest_type, ".platogram-cache")
        with open(converted_result, "rb") as fd:
            while True:
                data = fd.read(1024)
                if not data:
                    break
                yield data
    try:
        return StreamingResponse(result_generator())
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))
