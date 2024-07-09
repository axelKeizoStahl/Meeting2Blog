const loader = document.getElementById("loading");

function displayLoading() {
    loader.classList.remove("hidden");
}

function hideLoading() {
    loader.classList.add("hidden");
}

function generatePost() {

    let uploadType = "post";
    const prompt = document.getElementById("prompt").value;
    if (prompt != undefined && prompt != "") {
        uploadType = "query";
    }
    let formData = new FormData();
    if (uploadType == "post" && document.getElementById('urlInput').value != undefined) {
        formData.append('url', document.getElementById('urlInput').value);
    }
    
    // Simpler to just call it url for both?
    if (uploadType == "query" && document.getElementById('urlInput').value != undefined) {
        formData.append('urls', document.getElementById('urlInput').value);
    }
    if (document.getElementById('fileUpload').files[0] != undefined) {
        formData.append('file', document.getElementById('fileUpload').files[0]);
    }

    if (uploadType == "query") {
        formData.append('prompt', document.getElementById('prompt').value);
    }

    displayLoading();

    fetch(`http://localhost:8000/${uploadType}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        document.getElementById('render-result').mdContent = data.html;

        const downloadButton = document.getElementById('downloadButton');
            downloadButton.addEventListener('click', function() {
            downloadHTML(data.html);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        displayLoading();
        alert('An error occurred. Please try again.');
    });


    function convertMD(content, destType) {
        switch (destType) {
            case "MD":
            case "HTML":
            case "PDF":
            case "WORD":
        }
        return content;
    }
    function downloadHTML(markdownContent) {
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
}

function showButtons() {
    if (document.getElementById("submitFile").classList.contains('hidden')) {
        document.getElementById("submitFile").classList.remove('hidden')
        document.getElementById("submitURL").classList.remove('hidden')
        document.getElementById("submitPrompt").classList.remove('hidden')

    } else {
        document.getElementById("submitFile").classList.add('hidden')
        document.getElementById("submitURL").classList.add('hidden')
        document.getElementById("submitPrompt").classList.add('hidden')
        if (!document.getElementById("urlInput").classList.contains('hidden')) {
            document.getElementById("urlInput").classList.add('hidden')
        }
        if (!document.getElementById("prompt").classList.contains('hidden')) {
            document.getElementById("prompt").classList.add('hidden')
        }
    }
}
function showUrlInput() {
    if (document.getElementById("urlInput").classList.contains('hidden')) {
        document.getElementById("urlInput").classList.remove('hidden')
    } else {
        document.getElementById("urlInput").classList.add('hidden')
    }
}
function showPrompt() {
    if (document.getElementById("prompt").classList.contains('hidden')) {
        document.getElementById("prompt").classList.remove('hidden')
    } else {
        document.getElementById("prompt").classList.add('hidden')
    }
}
function downloadOptions() {
    if (document.getElementById("asMarkdown").classList.contains('hidden')) {
        document.getElementById("asMarkdown").classList.remove('hidden')
        document.getElementById("asHTML").classList.remove('hidden')
        document.getElementById("asPDF").classList.remove('hidden')
        document.getElementById("asWord").classList.remove('hidden')
    } else {
        document.getElementById("asMarkdown").classList.add('hidden')
        document.getElementById("asHTML").classList.add('hidden')
        document.getElementById("asPDF").classList.add('hidden')
        document.getElementById("asWord").classList.add('hidden')
    }
}
