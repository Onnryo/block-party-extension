function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

document.getElementById('uploadButton').addEventListener('click', function() {
    var fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        let file = fileInput.files[0];
        let reader = new FileReader();

        reader.onload = function(event) {
            try {
                let importedData = JSON.parse(event.target.result);
                if (!importedData.name || !importedData.site || !Array.isArray(importedData.users)) {
                    throw new Error("Imported data format is incorrect.");
                }
                let transformedUsers = importedData.users.map(username => ({
                    username: username,
                    status: 'not blocked'
                }));
                let newPackage = {
                    id: generateUniqueId(),
                    name: importedData.name,
                    site: importedData.site,
                    users: transformedUsers
                };

                chrome.storage.local.get({ userPackages: [] }, function(result) {
                    let packages = result.userPackages;
                    packages.push(newPackage);
                    chrome.storage.local.set({ userPackages: packages }, function() {
                        alert('Package imported successfully!');
                        window.close(); // Close the upload window
                    });
                });
            } catch (error) {
                alert('Failed to import package: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
});
