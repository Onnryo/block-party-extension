// Listeners for Chrome Runtime Events
chrome.runtime.onInstalled.addListener(initializeDefaultUserPackage);
chrome.runtime.onMessage.addListener(handleMessage);

// Initialization Functions
function initializeDefaultUserPackage() {
    fetch(chrome.runtime.getURL('userList.json'))
        .then(response => response.json())
        .then(data => {
            chrome.storage.local.get({ userPackages: [] }, function (result) {
                const packages = result.userPackages;
                const defaultPackage = {
                    name: data.name,
                    site: data.site,
                    users: data.users.map(user => ({ username: user, status: 'not blocked' }))
                };
                if (!packages.some(pkg => pkg.name === defaultPackage.name)) {
                    packages.push(defaultPackage);
                    chrome.storage.local.set({ userPackages: packages });
                }
            });
        })
        .catch(error => console.error('Failed to load default user package:', error));
}

function handleMessage(message, sender, sendResponse) {
    if (message.action === "startBlocking" && message.packageData) {
        blockUsersSequentially(message.packageData);
    }
}

function getRandomDelay(min = 1000, max = 3000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Core Functionality
function blockUsersSequentially(packageData) {
    const userToBlock = packageData.users.find(user => user.status === 'not blocked' || user.status === 'error');
    if (!userToBlock) {
        triggerNextPackageBlocking(packageData.site);
        return;
    }

    return new Promise((resolve, reject) => {
        let userUrl = `https://${packageData.site}/`;
        if (packageData.site === 'tiktok.com') {
            userUrl += `@${userToBlock.username}`;
        } else if (packageData.site === 'twitter.com') {
            userUrl += userToBlock.username;
        } else if (packageData.site === 'instagram.com') {
            userUrl += userToBlock.username;
        } else if (packageData.site === 'facebook.com') {
            userUrl += userToBlock.username;
        } else if (packageData.site === 'youtube.com') {
            userUrl += `@${userToBlock.username}`;
        } else {
            reject(new Error('Unsupported site.'));
        }

        chrome.tabs.create({ url: userUrl }, tab => {
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.sendMessage(tab.id, { type: 'BLOCK_USER', username: userToBlock.username, site: packageData.site }, response => {
                        if (chrome.runtime.lastError) {
                            console.error('Error sending message:', chrome.runtime.lastError.message);
                            chrome.tabs.remove(tab.id);
                            return reject(new Error(chrome.runtime.lastError.message));
                        }
                        if (!response) {
                            console.log('No response received');
                            chrome.tabs.remove(tab.id);
                            return reject(new Error('No response received'));
                        }
                        console.log('Response received:', response);
                        if (response.status === 'completed') {
                            userToBlock.status = 'blocked';
                        } else {
                            userToBlock.status = 'error';
                        }
                        setTimeout(() => {
                            chrome.tabs.remove(tab.id);
                            resolve();
                        }, getRandomDelay()); // Wait for a random length of time before closing the tab
                    });
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });
        });
    }).then(() => {
        saveCurrentPackageState(packageData);
        blockUsersSequentially(packageData);
    }).catch(() => {
        saveCurrentPackageState(packageData);
        blockUsersSequentially(packageData);
    });
}

function saveCurrentPackageState(packageData) {
    chrome.storage.local.get({ userPackages: [] }, function(result) {
        const updatedPackages = result.userPackages.map(pkg => pkg.name === packageData.name ? packageData : pkg);
        chrome.storage.local.set({ userPackages: updatedPackages }, () => {
            console.log(`Package data for ${packageData.name} updated in storage.`);
        });
    });
}

function triggerNextPackageBlocking(site) {
    chrome.storage.local.get({ userPackages: [] }, ({ userPackages }) => {
        const nextPackage = userPackages.find(pkg => pkg.site === site && pkg.users.some(user => user.status === 'not blocked'));
        if (nextPackage) {
            blockUsersSequentially(nextPackage);
        } else {
            console.log("All packages for site have been processed.");
        }
    });
}
