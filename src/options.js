// Global Variables
let currentHostname = '';
let currentPackage = null; // Store the current package for modifications
let validHostNames = ['tiktok.com', 'instagram.com', 'facebook.com', 'twitter.com', 'youtube.com'];

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeOptionsPage);
document.getElementById('blockUsersButton').addEventListener('click', initiateBlocking);
document.getElementById('backButton').addEventListener('click', showMainPage);
document.getElementById('addUserButton').addEventListener('click', addUser);
document.getElementById('saveButton').addEventListener('click', savePackageDetails);
document.getElementById('exportButton').addEventListener('click', exportPackageDetails);
document.getElementById('importButton').addEventListener('click', importPackage);
document.getElementById('createPackageButton').addEventListener('click', createNewPackage);

function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function initializeOptionsPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const url = new URL(tabs[0].url);
        currentHostname = url.hostname.replace(/^www\./, '');
        const siteName = currentHostname.replace(/\.\w+$/, '');
        document.getElementById('currentSite').textContent = siteName.charAt(0).toUpperCase() + siteName.slice(1);

        if (validHostNames.includes(currentHostname)) {
            document.getElementById('blockUsersButton').style.display = 'block';
        } else {
            document.getElementById('blockUsersButton').style.display = 'none';
        }
        
        loadPackages();
    });
}

function initiateBlocking() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const hostname = new URL(tabs[0].url).hostname.replace(/^www\./, '');
        chrome.storage.local.get({ userPackages: [] }, function({ userPackages }) {
            const packageToBlock = userPackages.find(pkg => pkg.site === hostname && pkg.users.some(user => user.status === 'not blocked'));
            if (packageToBlock) {
                chrome.runtime.sendMessage({ action: "startBlocking", packageData: packageToBlock });
            } else {
                console.log("No more packages to process for this site.");
            }
        });
    });
}

function showMainPage() {
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('packageDetails').style.display = 'none';
    loadPackages(); // Refresh the list of packages when going back
}

function addUser() {
    const userInput = document.getElementById('userInput');
    const newUser = userInput.value.trim();
    if (newUser && !currentPackage.users.some(user => user.username === newUser)) { // Ensure the user is not already in the list
        currentPackage.users.unshift({username: newUser, status: 'not blocked'}); // Add to the start of the list
        updateUserList(); // Update the UI to reflect the new user list
        userInput.value = '';  // Clear the input after adding
    }
}

function savePackageDetails() {
    // Read the input values directly
    const packageName = document.getElementById('packageName').value.trim();
    const packageSite = document.getElementById('packageSite').value.trim().replace(/^www\./, '');
    document.getElementById('packageSite').value = packageSite;

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
}

function exportPackageDetails() {
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
}

function importPackage() {
    // Open a new tab or small window with the upload interface
    chrome.windows.create({
        url: chrome.runtime.getURL("upload.html"),
        type: "popup",
        width: 800,
        height: 500
    });
}

function deletePackage(packageName) {
    chrome.storage.local.get(['userPackages'], function(result) {
        let packages = result.userPackages || [];
        packages = packages.filter(pkg => pkg.name !== packageName);
        chrome.storage.local.set({userPackages: packages}, loadPackages);
    });
}

function createNewPackage() {
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

    const progressElement = document.getElementById('details-progress');
    progressElement.textContent = '...';
    progressElement.style.color = 'red';

    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('packageDetails').style.display = 'block';
}

// Package Management Functions
function loadPackages() {
    chrome.storage.local.get(['userPackages'], function(result) {
        const packages = result.userPackages || [];
        const listElement = document.getElementById('packagesList');
        listElement.innerHTML = ''; // Clear the current list completely
        let numBlocked = 0;
        let numTotal = 0;
        const filteredPackages = validHostNames.includes(currentHostname) ? packages.filter(pkg => pkg.site === currentHostname) : packages;

        filteredPackages.forEach(function(pkg) {
            const entry = document.createElement('li');
            entry.textContent = pkg.name;
            entry.onclick = () => showPackageDetails(pkg);
            entry.appendChild(createDeleteButton(pkg));
            listElement.appendChild(entry);
            pkg.users.forEach(user => {
                numTotal++;
                if (user.status === 'blocked') numBlocked++;
            });
        });
        updateProgress(numBlocked, numTotal, 'main-progress');
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
            const blockedUsersCount = updatedPackage.users.filter(user => user.status === 'blocked').length;
            const totalUsersCount = updatedPackage.users.length;
            updateProgress(blockedUsersCount, totalUsersCount, 'details-progress');
            document.getElementById('mainPage').style.display = 'none';
            document.getElementById('packageDetails').style.display = 'block';
        }
    });
}

// UI Helper Functions
function createDeleteButton(pkg) {
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.style.backgroundImage = 'url("icons/delete.png")';
    deleteButton.style.backgroundRepeat = 'no-repeat';
    deleteButton.style.backgroundPosition = 'center';
    deleteButton.style.backgroundSize = 'cover';
    deleteButton.style.width = '20px';
    deleteButton.style.height = '20px';
    deleteButton.style.padding = '5px';
    deleteButton.onclick = function(event) {
        event.stopPropagation();
        deletePackage(pkg.name);
    };
    return deleteButton;
}

function updateProgress(numBlocked, numTotal, progressElementId) {
    const progressElement = document.getElementById(progressElementId);
    progressElement.textContent = `${numBlocked} / ${numTotal}`;
    progressElement.style.color = numBlocked === numTotal ? 'green' : 'red';
}

function updateUserList() {
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = '';
    currentPackage.users.forEach(user => {
        const userEntry = document.createElement('li');
        userEntry.appendChild(createUserLink(user));
        userEntry.appendChild(createStatusLabel(user));
        userEntry.appendChild(createDeleteButtonForUser(user));
        userListElement.appendChild(userEntry);
    });
}

// TODO: take site as argument and use it to construct site specific user url
function createUserLink(user) {
    const userLink = document.createElement('a');
    userLink.href = `https://www.${currentPackage.site}/@${user.username}`;
    userLink.textContent = user.username;
    userLink.target = "_blank";
    return userLink;
}

function createStatusLabel(user) {
    const statusLabel = document.createElement('span');
    statusLabel.textContent = ` (${user.status})`;
    statusLabel.style.color = user.status === 'blocked' ? 'green' : 'red';
    return statusLabel;
}

function createDeleteButtonForUser(user) {
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.style.backgroundImage = 'url("icons/delete.png")';
    deleteButton.style.backgroundRepeat = 'no-repeat';
    deleteButton.style.backgroundPosition = 'center';
    deleteButton.style.backgroundSize = 'cover';
    deleteButton.style.width = '20px';
    deleteButton.style.height = '20px';
    deleteButton.style.padding = '5px';
    deleteButton.onclick = (event) => {
        event.preventDefault();
        currentPackage.users = currentPackage.users.filter(u => u !== user);
        updateUserList();
    };
    return deleteButton;
}
