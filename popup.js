document.addEventListener("DOMContentLoaded", function () {
  const toggleFP = document.getElementById("toggleFolderPlacement");

  try {

    // Load stored setting or default to false if undefined
    chrome.storage.local.get("folderBefore", function (data) {
      if (chrome.runtime.lastError || data.folderBefore === undefined) {
          chrome.storage.local.set({ folderBefore: false });
          toggleFP.checked = false; // Default to folders appearing after bookmarks
      } else {
          toggleFP.checked = data.folderBefore;
      }
    });

    // Event listener for toggle switch
    toggleFP.addEventListener("change", function () {
        const folderBefore = toggleFP.checked;
        chrome.storage.local.set({ folderBefore: folderBefore });
        console.log(folderBefore);
        console.log(chrome.storage.local.get("folderBefore"));
    });

  } catch (error) {
      console.error("Error accessing storage:", error);
  }
});


document.addEventListener("DOMContentLoaded", function () {
  const toggleSort = document.getElementById("toggleSorting");

  try { 

    // Load stored setting or default to false if undefined
    chrome.storage.local.get("sortAll", function (data) { 
      if (chrome.runtime.lastError || data.sortAll === undefined) {
          chrome.storage.local.set({ sortAll: false });
          toggleSort.checked = false; // Default to folders appearing after bookmarks
      } else {
          toggleSort.checked = data.sortAll;
      }
    });
    
    // Event listener for toggle switch
    toggleSort.addEventListener("change", function () {
        const sortAll = toggleSort.checked;
        chrome.storage.local.set({ sortAll: sortAll });
    });
  } catch (error) {
    console.error("Error accessing storage:", error);
  }
});
