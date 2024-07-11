from platogram import Content
from pypandoc import convert_text


def format_time(ms):
    seconds = ms // 1000
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


def content_to_html(content: Content) -> str:
    index = content

    html = f"""
        <h2>{index.title}</h2>
        <h4>{index.summary}</h4>
    """

    for paragraph in index.passages:
        html += f"<p>{paragraph}</p>"

    html += """
        <details>
        <summary>Expand for transcript</summary>
    """

    for chunk in index.transcript:
        timestamp = format_time(chunk.time_ms)

        html += f"""
           <h8>time: {timestamp}</h7>
           <h6>{chunk.text}</h6>
       """

    html += "</details>"

    return html


def extract_html(content: str) -> str:
    start = content.find("<")
    end = content.rfind(">")
    if start == -1 or end == -1:
        return content
    else:
        return content[start:end]


def HTML_to_format(content: str, format_type: str, dest_dir: str) -> str:
    dest_file = f"{dest_dir}/result.{format_type}"
    output = convert_text(content, format_type, type="html", outputfile=dest_file)
    return dest_file
