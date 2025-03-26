document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.getElementById("toggleFolderSorting");

  try {

    // Load stored setting or default to false if undefined
    chrome.storage.local.get("folderBefore", function (data) {
      if (chrome.runtime.lastError || data.folderBefore === undefined) {
          chrome.storage.local.set({ folderBefore: false });
          toggleSwitch.checked = false; // Default to folders appearing after bookmarks
      } else {
          toggleSwitch.checked = data.folderBefore;
      }
    });

    // Event listener for toggle switch
    toggleSwitch.addEventListener("change", function () {
        const folderBefore = toggleSwitch.checked;
        chrome.storage.local.set({ folderBefore: folderBefore });
        console.log(folderBefore);
        console.log(chrome.storage.local.get("folderBefore"));
    });

  } catch (error) {
      console.error("Error accessing storage:", error);
  }
});
