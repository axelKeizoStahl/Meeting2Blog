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
    const promptValue = document.getElementById("prompt").value.trim();
    const urlValue = document.getElementById('urlInput').value.trim();
    const file = document.getElementById('fileUpload').files[0];

    let uploadType = "post";
    if (promptValue !== "") {
        uploadType = "query";
    }

    const formData = new FormData();
    if (urlValue !== "") {
        formData.append('url', urlValue);
    }
    if (file) {
        formData.append('file', file);
    }
    if (uploadType === "query") {
        formData.append('prompt', promptValue);
    }

    toggleElement("loading");

    fetch(`http://localhost:8000/${uploadType}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        toggleElement("loading");
        toggleElement("downloadButton");
        document.getElementById('render-result').innerHTML = data.html;
    })
    .catch(error => {
        console.error('Error:', error);
        toggleElement("loading");
        alert('An error occurred. Please try again.');
    });
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
