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
        console.log(data)
        console.log(data.markdown)
        document.getElementById('render-result').mdContent = data.markdown;

        toggleElement("downloadButton");
        const downloadButton = document.getElementById('downloadButton');
        downloadButton.addEventListener('click', function() {
            downloadHTML(data.markdown);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        toggleElement("loading");
        alert('An error occurred. Please try again.');
    });
}

function convertMD(content, destType) {
    switch (destType) {
        case "MD":
        case "HTML":
        case "PDF":
        case "WORD":
    }
   return content;
}
function downloadHTML() {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

