chrome.runtime.onInstalled.addListener(() => {
    fetch(chrome.runtime.getURL('userList.json'))
        .then(response => response.json())
        .then(data => {
            // Store the user list in local storage
            // TODO: local storage should consist of a list of "user packages" that contains the package name, the site url, and the user list
            // TODO: add status property to each user in user package (blocked, not blocked, error) initialized to not blocked
            chrome.storage.local.set({ usersToBlock: data.users });
        })
        .catch(error => console.error('Failed to load user list:', error));
});

function blockUsersSequentially(usersToBlock) {
    if (usersToBlock.length === 0) {
        console.log("All users processed.");
        return Promise.resolve();
    }

    const user = usersToBlock.shift();
    return new Promise((resolve, reject) => {
        chrome.tabs.create({ url: `https://www.tiktok.com/@${user}` }, tab => {
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    // This event is consumed by blockUser.js
                    chrome.tabs.sendMessage(tab.id, { type: 'BLOCK_USER', username: user }, response => {
                        chrome.tabs.remove(tab.id); // Close the tab
                        if (response.status === 'completed') {
                            console.log(`${user} blocked successfully.`);
                            resolve();
                        } else {
                            console.error(`Failed to block ${user}:`, response.error);
                            reject(response.error);
                        }
                    });
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });
        });
    }).then(() => blockUsersSequentially(usersToBlock));
}

// This event is fired in options.js when the block all users button is clicked
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startBlocking") {
        chrome.storage.local.get("usersToBlock", ({ usersToBlock }) => {
            blockUsersSequentially([...usersToBlock]).then(() => {
                console.log("Completed blocking all users.");
            }).catch(error => {
                console.error("Error during blocking sequence:", error);
            });
        });
    }
});
