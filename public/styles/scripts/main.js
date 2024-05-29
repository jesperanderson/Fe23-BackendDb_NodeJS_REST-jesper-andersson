function fetchTable(tableName) {
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ table_name: tableName })
    })
    .then(response => response.text())
    .then(html => {
        document.getElementById('table-container').innerHTML = html;
    })
    .catch(error => console.error('Error:', error));
}
