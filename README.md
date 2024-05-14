# Block Party Extension

Block Party is a Chrome extension designed to empower you to reclaim your attention online. In today's attention economy, you deserve the power to choose how you interact. With Block Party, you can create and manage blocklists, giving you control over who influences your online experienc

## Disclaimer

Before using the Block Party Extension, please be aware that automating interactions on websites, including blocking users, might violate the terms of service of some platforms. We encourage you to review the terms of service of any website you use with this extension. The developers of Block Party are not responsible for any consequences that arise from such violations.

## Usage

### Creating and Managing Blocklists
1. **Importing Blocklists:** Users can start by importing pre-existing blocklists available in simple JSON format. This can be done via the import feature in the extension's options page. Default blocklists can be found in the `./lists` directory.
![Importing Blocklists](images/import.gif "Importing a New Blocklist")
2. **Creating Blocklists:** Users can also create their own blocklists by adding websites and specifying usernames they wish to block.
![Creating Blocklists](images/create.gif "Creating a New Blocklist")
1. **Navigating Blocklists:** When visiting a supported site, only blocklists relevant to that site are shown, enhancing usability and focus. On non-supported sites, all blocklists are visible but the block functionality is hidden.

Block Party currently supports:
- [x] TikTok
- [ ] Instagram
- [ ] Facebook
- [x] Twitter
- [ ] YouTube


When you are on one of these supported sites, the 'Block Users' button appears, enabling you to begin the automatic blocking process. Simply activate it and the extension handles the rest—systematically blocking users according to your blocklist. Relax and observe as it seamlessly cleans up your online space.
![Running](images/block.gif "Running Blocklists")
</br>Have a particularly long list? Don't worry, you can halt the automation anytime by simply closing the tab. You can resume the blocking process whenever you choose. Keep track of your progress directly through the extension popup, where you can see overall or blocklist-specific progress.

### Sharing and Exporting Blocklists
Blocklists can be easily shared with others by exporting them into JSON files, fostering a community-based approach to content management.

![Exporting Blocklists](images/export.gif "Exporting a Blocklist")

## Installation

### From Source
1. **Enable Developer Mode in Chrome:** Go to `chrome://extensions/` and toggle 'Developer mode' at the top right.
2. **Download the Source:** Clone or download the ZIP from the [GitHub repository](#).
3. **Load Unpacked Extension:** Unzip if necessary and use the 'Load unpacked' button in the Chrome extensions page to select the `./src` directory from the downloaded files.

### From the Chrome Web Store (Maybe Soon)
- I doubt this passes google review but we can dream.

## Support

For support, please visit our [GitHub issues page](#). We appreciate if you could provide a detailed description of the issue including steps to reproduce, expected outcome, and actual outcome. For enhancements, kindly suggest your idea with as much detail as possible.

## Authors and Acknowledgment

Thanks to all the contributors who have invested their time and effort in making Block Party a reality. Your contributions are greatly appreciated!

## Donations

Please consider supporting the following causes:
- [Palestine Children's Relief Fund](https://pcrf.net/)
- [Medical Aid for Palestinians](https://www.map.org.uk/) 

Your support can make a significant difference in these communities.


## License

Block Party is made available under the MIT License. This means you are free to use, modify, and distribute it as you see fit.

## Project Status

Development of Block Party is ongoing. Contributions are welcome, and those interested in contributing can fork the project or submit pull requests. For major changes, please open an issue first to discuss what you would like to change.
