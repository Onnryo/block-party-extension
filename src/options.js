let currentHostname = '';
let currentPackage = null; // Store the current package for modifications
let validHostNames = ['www.tiktok.com', 'www.instagram.com', 'www.facebook.com', 'www.twitter.com', 'www.youtube.com'];

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const url = new URL(tabs[0].url);
    currentHostname = url.hostname;
    document.getElementById('currentSite').textContent = `Block users on ${currentHostname}`;

    const blockButton = document.getElementById('blockUsersButton');
    if (validHostNames.includes(currentHostname)) {
        blockButton.style.display = 'block';
    } else {
        blockButton.style.display = 'none';
    }

    loadPackages();
});

function loadPackages() {
    chrome.storage.local.get(['userPackages'], function(result) {
        const packages = result.userPackages || [];
        const listElement = document.getElementById('packagesList');
        listElement.innerHTML = ''; // Clear the current list completely

        packages.forEach(function(pkg) {
            const entry = document.createElement('li');
            entry.textContent = pkg.name;
            entry.onclick = () => showPackageDetails(pkg);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function(event) {
                event.stopPropagation();
                deletePackage(pkg.name);
            };
            entry.appendChild(deleteButton);
            listElement.appendChild(entry);
        });
        console.log("Packages loaded:", packages);
    });
}


function showPackageDetails(pkg) {
    chrome.storage.local.get({ userPackages: [] }, function(result) {
        const updatedPackage = result.userPackages.find(p => p.name === pkg.name);
        if (updatedPackage) {
            currentPackage = updatedPackage; // Update the current package with fresh data
            document.getElementById('packageName').value = updatedPackage.name;
            document.getElementById('packageSite').value = updatedPackage.site;
            updateUserList();

            document.getElementById('mainPage').style.display = 'none';
            document.getElementById('packageDetails').style.display = 'block';
        }
    });
}

function updateUserList() {
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = '';
    currentPackage.users.forEach(user => {
        const userEntry = document.createElement('li');
        userEntry.textContent = user.username;
        const statusLabel = document.createElement('span');
        statusLabel.textContent = ` (${user.status})`;
        userEntry.appendChild(statusLabel);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
            currentPackage.users = currentPackage.users.filter(u => u !== user);
            updateUserList();
        };
        userEntry.appendChild(deleteButton);
        userListElement.appendChild(userEntry);
    });
}

function addUser() {
    const userInput = document.getElementById('userInput');
    const newUser = userInput.value.trim();
    if (newUser && !currentPackage.users.includes(newUser)) {
        currentPackage.users.push({username: newUser, status: 'not blocked'});
        updateUserList();
        userInput.value = '';  // Clear the input after adding
    }
}

function deletePackage(packageName) {
    chrome.storage.local.get(['userPackages'], function(result) {
        let packages = result.userPackages || [];
        packages = packages.filter(pkg => pkg.name !== packageName);
        chrome.storage.local.set({userPackages: packages}, loadPackages);
    });
}

document.getElementById('blockUsersButton').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;

        chrome.storage.local.get({ userPackages: [] }, ({ userPackages }) => {
            const firstRelevantPackage = userPackages.find(pkg => pkg.site === hostname && pkg.users.some(user => user.status === 'not blocked'));
            if (firstRelevantPackage) {
                chrome.runtime.sendMessage({ action: "startBlocking", packageData: firstRelevantPackage });
            } else {
                console.log("No more packages to process for this site.");
            }
        });
    });
});

function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

document.getElementById('backButton').addEventListener('click', function() {
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('packageDetails').style.display = 'none';
    loadPackages(); // Refresh the list of packages when going back
});

document.getElementById('addUserButton').addEventListener('click', addUser);

document.getElementById('saveButton').addEventListener('click', function() {
    // Read the input values directly
    const packageName = document.getElementById('packageName').value.trim();
    const packageSite = document.getElementById('packageSite').value.trim();

    // Update the currentPackage object
    if (currentPackage) {
        currentPackage.name = packageName;
        currentPackage.site = packageSite;
    }

    // Save or update the current package using the unique ID for lookup
    chrome.storage.local.get(['userPackages'], function(result) {
        let packages = result.userPackages || [];
        const index = packages.findIndex(pkg => pkg.id === currentPackage.id);

        if (index !== -1) {
            packages[index] = currentPackage; // Update existing package
        } else {
            packages.push(currentPackage); // Add new package if it's new
        }

        chrome.storage.local.set({ userPackages: packages }, function() {
            alert('Package saved successfully!');
            loadPackages(); // Reload the packages list
        });
    });
});

document.getElementById('exportButton').addEventListener('click', function() {
    chrome.storage.local.get(['userPackages'], function(result) {
        const exportPackage = result.userPackages.find(p => p.name === currentPackage.name);
        if (exportPackage) {
            // Create a new object for exporting with the simplified user array
            const simplifiedPackage = {
                name: exportPackage.name,
                site: exportPackage.site,
                users: exportPackage.users.map(user => user.username) // Map to only include usernames
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simplifiedPackage));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", exportPackage.name + ".json");
            document.body.appendChild(downloadAnchorNode); // Required for Firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    });
});

// Function to handle importing user packages
document.getElementById('importButton').addEventListener('click', function() {
    // Open a new tab or small window with the upload interface
    chrome.windows.create({
        url: chrome.runtime.getURL("upload.html"),
        type: "popup",
        width: 400,
        height: 400
    });
});

// Function to handle creating a new user package

document.getElementById('createPackageButton').addEventListener('click', function() {
    // Initialize a blank package with a unique ID
    currentPackage = {
        id: generateUniqueId(),  // Assign a unique ID
        name: '',
        site: '',
        users: []
    };
    document.getElementById('packageName').value = '';
    document.getElementById('packageSite').value = '';
    updateUserList();

    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('packageDetails').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function() {
    if (currentHostname) {
        loadPackages();
    }
});
