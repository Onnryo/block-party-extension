// Predefined list of usernames to block
const predefinedUsernames = ['user1', 'user2', 'user3'];

// Function to initialize the storage with predefined usernames if it's empty
function initializeUsernames() {
    chrome.storage.local.get(['usersToBlock'], function(result) {
        if (!result.usersToBlock || result.usersToBlock.length === 0) {
            chrome.storage.local.set({usersToBlock: predefinedUsernames}, function() {
                console.log('User list initialized.');
            });
        }
    });
}

// Load the list of blocked users and display it
function loadUsernames() {
    chrome.storage.local.get(['usersToBlock'], function(result) {
        const usernames = result.usersToBlock || [];
        const listElement = document.getElementById('usernameList');
        listElement.innerHTML = '';
        usernames.forEach(function(username) {
            const entry = document.createElement('li');
            entry.textContent = username;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = function() {
                removeUsername(username);
            };
            entry.appendChild(removeButton);
            listElement.appendChild(entry);
        });
    });
}

// Add a new username to the block list
function addUsername() {
    const input = document.getElementById('usernameInput');
    const newUsername = input.value.trim();
    if (newUsername) {
        chrome.storage.local.get(['usersToBlock'], function(result) {
            const usernames = result.usersToBlock || [];
            if (!usernames.includes(newUsername)) {
                usernames.push(newUsername);
                chrome.storage.local.set({usersToBlock: usernames}, function() {
                    loadUsernames();
                    input.value = '';  // Clear the input after adding
                });
            }
        });
    }
}

// Remove a username from the block list
function removeUsername(username) {
    chrome.storage.local.get(['usersToBlock'], function(result) {
        let usernames = result.usersToBlock || [];
        usernames = usernames.filter(function(u) {
            return u !== username;
        });
        chrome.storage.local.set({usersToBlock: usernames}, function() {
            loadUsernames();
        });
    });
}

// Initial load of usernames and check initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeUsernames();
    loadUsernames();
});

document.getElementById('blockUsersButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: "startBlocking" });
});
