document.getElementById('newDoc').addEventListener('click', function() {
  var title = prompt('Enter document title');
  var content = prompt('Enter document content');
  fetch('/documents', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({title: title, content: content}),
  })
  .then(response => response.json())
  .then(data => {
      console.log('Success:', data);
      // ドキュメントリストを更新
      loadDocuments();
  })
  .catch((error) => {
      console.error('Error:', error);
  });
});

function loadDocuments() {
  fetch('/documents')
  .then(response => response.json())
  .then(data => {
      var documentList = document.getElementById('documentList');
      documentList.innerHTML = '';
      data.forEach(function(doc) {
          var div = document.createElement('div');
          div.textContent = doc.title;
          documentList.appendChild(div);
      });
  });
}

// ページロード時にドキュメントリストをロード
loadDocuments();