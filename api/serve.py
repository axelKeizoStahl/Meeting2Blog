from fastapi import FastAPI, HTTPException, UploadFile, File, Form, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import logging
from response import content_to_html, extract_html, HTML_to_format
from synthesize import summarize_audio, prompt_content
from tarfile import TarFile
from tempfile import TemporaryDirectory, SpooledTemporaryFile
from typing import List


app = FastAPI()
logger = logging.getLogger(__name__)


def get_src(
    urls: str | None = Form(None), files: UploadFile | None = File(None)
) -> List[str | SpooledTemporaryFile]:
    sources = []

    if files is not None:
        file_tar = TarFile(fileobj=files.file, mode="r")
        file_members = file_tar.getmembers()
        sources = [file_tar.extractfile(member) for member in file_members]
    if urls is not None:
        sources += [url for url in urls.split(",")]
    if sources == []:
        raise HTTPException(status_code=400, detail="No URL or file found in request")
    return sources


@app.get("/")
async def redirect_to_home():
    return RedirectResponse(url="/home")


app.mount("/home", StaticFiles(directory="../web_app", html=True), name="static")


@app.post("/post")
async def generate_post(
    url: str | None = Form(None),
    file: UploadFile | None = File(None),
    prompt: str | None = Form(None)
) -> dict:
    try:
        src = get_src(url, file)[0]

        content = await summarize_audio(src)

        html_content = content_to_html(content)

        response = {"html": html_content}
        if prompt is not None:
            response = await prompt_content(content, prompt)

            prompt = f"return only html to acuratelly represent a blog post on the following text:\n{response}"
            response = await prompt_content(content, prompt)

            response = extract_html(response)
        return response
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/post/convertHTML")
async def convert_HTML(content: str, dest_type: str) -> FileResponse:
    try:
        with TemporaryDirectory as temp_dir:
            converted_result = HTML_to_format(content, dest_type, str(temp_dir))
            return FileResponse(converted_result)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))
