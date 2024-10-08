function toggleElement(id) {
    const elm = document.getElementById(id);
    if (elm) {
        let elmClasses = elm.classList;
        if (elmClasses.contains("hidden")) elmClasses.remove("hidden");
        else elmClasses.add("hidden");
    }
}

function toggleChildren(parentId, excludes) {
    const parent = document.getElementById(parentId);
    if (parent) {
        const children = parent.children;
        for (let i = 0; i < children.length; i++) {
            let id = children[i].id;
            if (!excludes.includes(id)) toggleElement(id);
        }
    }
}

function generatePost() {
    const elm = document.getElementById('downloads');
    elm.classList.add("hidden");

    const urlValue = document.getElementById('urlInput').value.trim();
    const files = document.getElementById('fileUpload').files;
    const anthropicKey = document.getElementById('anthropic-key').value.trim();
    const assemblyaiKey = document.getElementById('assemblyai-key').value.trim();
    const formData = new FormData();

    if (urlValue !== "") {
        formData.append('url', urlValue);
    }
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }
    }
    if (anthropicKey === "" || assemblyaiKey === "") {
        alert('Please provide an assemblyAI api key and an anthropic api key.');
        return;
    } else {
        formData.append('anthropic', anthropicKey);
        formData.append('assemblyai', assemblyaiKey);
    }
    if (formData.has('url') || formData.has('file')) {
        toggleElement("loading");

        fetch(`http://localhost:8000/post`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            toggleElement("loading");
            toggleElement("downloads");
            toggleElement("render-result");
            const elm = document.getElementById('render-result');
            elm.classList.remove("hidden");
            document.getElementById('render-result').innerHTML = data.html;
        })
        .catch(error => {
            console.error('Error:', error);
            toggleElement("loading");
            alert('An error occurred. Please try again.');
        });
    } else {
        alert('It seems you have not uploaded any sources, please do so to generate your post.');
    }
}


async function downloadContent(destType) {
    try {
        const formData = new FormData();
        const htmlContent = document.getElementById("render-result").innerHTML;
        formData.append('content', htmlContent);
        formData.append('dest_type', destType);
        const response = await fetch('/post/convertHTML', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        let filename = 'download';
        if (contentDisposition && filenameRegex.test(contentDisposition)) {
            filename = decodeURIComponent(contentDisposition.match(filenameRegex)[1].replace(/['"]/g, ''));
        } else {
            filename += `.${destType}`;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `blog.${destType}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading content:', error);
    }
}

document.getElementById('fileUpload').addEventListener('change', function(event) {
            var fileInput = event.target;
            var fileName = fileInput.files.length > 0 ? Array.from(fileInput.files).map(file => file.name).join(', ') : 'No Files Selected.';
            document.getElementById('listFiles').textContent = fileName;
        });
