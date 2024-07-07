from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from response import content_to_html, extract_html
from synthesize import summarize_audio, prompt_content
from tarfile import TarFile
from tempfile import SpooledTemporaryFile
from typing import List


app = FastAPI()


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
    url: str | None = Form(None), file: UploadFile | None = File(None)
) -> dict:
    try:
        src = get_src(url, file)[0]

        content = await summarize_audio(src)

        html_content = content_to_html(content)

        response = {"html": html_content}
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def refine_post(
    urls: str | None = Form(None),
    file: UploadFile | None = File(None),
    prompt: str = Form(...),
) -> dict:
    try:
        sources = get_src(urls, file)
        content = [await summarize_audio(src) for src in sources]

        response = await prompt_content(content, prompt)

        prompt = f"return only html code to acuratelly represent a blog post on the following text:\n{response}"
        response = await prompt_content(content, prompt)

        html_content = extract_html(response)

        return {"html": html_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

