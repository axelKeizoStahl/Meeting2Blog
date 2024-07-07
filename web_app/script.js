document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let uploadType = "post";
    if (document.getElementById("query").checked) {
        uploadType = "query";
    }
    let formData = new FormData();
    if (uploadType == "post" && document.getElementById('urlInput').value != undefined) {
        formData.append('url', document.getElementById('urlInput').value);
    }
    
    if (uploadType == "query" && document.getElementById('urlInput').value != undefined) {
        formData.append('urls', document.getElementById('urlInput').value);
    }
    if (document.getElementById('fileUpload').files[0] != undefined) {
        formData.append('file', document.getElementById('fileUpload').files[0]);
    }

    if (uploadType == "query") {
        formData.append('prompt', document.getElementById('prompt').value);
    }


    fetch(`http://localhost:8000/${uploadType}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerHTML = data.html;

        const downloadButton = document.getElementById('downloadButton');
            downloadButton.addEventListener('click', function() {
            downloadHTML(data.html, 'generated-post.html');
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });


    function downloadHTML(htmlContent, fileName) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

