from fastapi import UploadFile
from hashlib import sha256
from pathlib import Path
import platogram as plato
from platogram.types import Content
import os
from tempfile import TemporaryDirectory
from typing import Literal
from urllib.parse import urlparse


CACHE_DIR = Path("./.platogram-cache")
# Handle cache rotation


async def make_file_name(src: str | UploadFile) -> str:
    if not isinstance(src, str):
        hash = await src.read()
        await src.seek(0)
    else:
        hash = src.encode()
    hash = sha256(hash).hexdigest()
    return hash


def is_uri(src: str) -> bool:
    try:
        result = urlparse(src)
        return all([result.scheme, result.netloc, result.path])
    except Exception as _:
        return False


async def get_audio_url(
    src: str | UploadFile, temp_dir: str | None
) -> str:
    if isinstance(src, str) and is_uri(src):
        return src
    else:
        dest_file = f"{temp_dir}/{await make_file_name(src)}"
        await src.seek(0)
        with open(dest_file, "wb") as content:
            content.write(await src.read())
        return f"file://{os.path.abspath(dest_file)}"


async def summarize_audio(
    src: str | UploadFile,
    assemblyai: str,
    anthropic: str,
    anthropic_model: str = "claude-3-5-sonnet",
    assembly_ai_model: str = "best"
) -> Content:
    llm = plato.llm.get_model(
        f"anthropic/{anthropic_model}", anthropic
    )
    asr = plato.asr.get_model(
        f"assembly-ai/{assembly_ai_model}", assemblyai
    )

    CACHE_DIR.mkdir(exist_ok=True)

    cache_file = CACHE_DIR / f"{await make_file_name(src)}.json"

    if cache_file.exists():
        content = Content.model_validate_json(open(cache_file).read())
    else:
        with TemporaryDirectory() as temp_dir:
            url = await get_audio_url(src, temp_dir)
            transcript = plato.extract_transcript(url, asr)

        content = plato.index(transcript, llm)
        open(cache_file, "w").write(content.model_dump_json(indent=2))

    return content


async def prompt_content(
    content: list[Content],
    prompt: str,
    anthropic: str,
    anthropic_model: str = "claude-3-5-sonnet",
    context_size: Literal["small", "medium", "large"] = "small",
) -> str:
    llm = plato.llm.get_model(
        f"anthropic/{anthropic_model}", anthropic
    )

    response = llm.prompt(
        prompt=prompt,
        context=content,
        context_size=context_size,
    )
    return response
