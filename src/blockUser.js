chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'BLOCK_USER') {
        try {
            if (message.site === 'tiktok.com') {
                tryBlockTikTokUser(message.username).then(() => {
                    sendResponse({ status: 'completed' });
                }).catch(error => {
                    sendResponse({ status: 'failed', error: error.message });
                });
            } else if (message.site === 'twitter.com') {
                tryBlockTwitterUser(message.username).then(() => {
                    sendResponse({ status: 'completed' });
                }).catch(error => {
                    sendResponse({ status: 'failed', error: error.message });
                });
            } else if (message.site === 'instagram.com') {
                tryBlockInstagramUser(message.username).then(() => {
                    sendResponse({ status: 'completed' });
                }).catch(error => {
                    sendResponse({ status: 'failed', error: error.message });
                });
            } else if (message.site === 'facebook.com') {
                tryBlockFacebookUser(message.username).then(() => {
                    sendResponse({ status: 'completed' });
                }).catch(error => {
                    sendResponse({ status: 'failed', error: error.message });
                });
            } else if (message.site === 'youtube.com') {
                tryBlockYouTubeUser(message.username).then(() => {
                    sendResponse({ status: 'completed' });
                }).catch(error => {
                    sendResponse({ status: 'failed', error: error.message });
                });
            } else {
                sendResponse({ status: 'failed', error: 'Site not supported.' });
            }
            return true; // Keeps the message channel open for the response
        } catch (error) {
            console.error('Failed to block user:', error);
            sendResponse({ status: 'failed', error: error.message });
        }
    }
});

function simulateMouseEvent(element, eventType) {
    const mouseEvent = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(mouseEvent);
}

function waitForElementWithTimeout(selector, timeoutMs) {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                obs.disconnect(); // Stop watching after the element is found
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });

        // Set a timeout to reject the promise if the element is not found within the timeout period
        setTimeout(() => {
            observer.disconnect();
            resolve(null); // Resolve as null if the timeout is reached without finding the element
        }, timeoutMs);
    });
}

function tryBlockTikTokUser(username) {
    return new Promise(async (resolve, reject) => {
        try {
            const ellipsesButton = await waitForElementWithTimeout('div[data-e2e="user-more"]', 2000);
            if (!ellipsesButton) {
                reject('User could not be loaded.')
            }
            simulateMouseEvent(ellipsesButton, 'mouseover');
            simulateMouseEvent(ellipsesButton, 'mousedown');
            simulateMouseEvent(ellipsesButton, 'mouseup');

            // Check if the "Block" button is available or if the user is already blocked
            const blockButton = await waitForElementWithTimeout('div[aria-label="Block"]', 2000);

            if (blockButton) {
                blockButton.click();
                const confirmButton = await waitForElementWithTimeout('button[data-e2e="block-popup-block-btn"]', 2000);
                if (confirmButton) {
                    confirmButton.click();
                    resolve('User has been confirmed blocked.');
                } else {
                    reject('Could not find confirmation button')
                }
            } else {
                // The presence of an "Unblock" button means the user is already blocked
                const unblockButton = await waitForElementWithTimeout('div[aria-label="Unblock"]', 2000);
                if (unblockButton) {
                    console.log('User is already blocked.');
                    resolve('User is already blocked.');
                } else {
                    reject('Block button not found and user is not already blocked.');
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

function tryBlockTwitterUser(username) {
    return new Promise((resolve, reject) => {
        // TODO: Implement Twitter blocking logic here
        reject(new Error('Twitter blocking not yet supported.'));
    });
}

function tryBlockInstagramUser(username) {
    return new Promise((resolve, reject) => {
        // TODO: Implement Instagram blocking logic here
        reject(new Error('Instagram blocking not yet supported.'));
    });
}

function tryBlockFacebookUser(username) {
    return new Promise((resolve, reject) => {
        // TODO: Implement Facebook blocking logic here
        reject(new Error('Facebook blocking not yet supported.'));
    });
}

function tryBlockYouTubeUser(username) {
    return new Promise((resolve, reject) => {
        // TODO: Implement YouTube blocking logic here
        reject(new Error('YouTube blocking not yet supported.'));
    });
}
