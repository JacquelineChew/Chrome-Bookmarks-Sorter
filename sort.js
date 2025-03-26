// NOTES:
// Does not sort bookmarks inside "Bookmarks bar"
// Does not sort folders (Folders stay near the top, or near bottom)
// "chrome://discards" always stays at the top
// All other bookmarks sorted in reverse chronological order (newest first) 

const bm = chrome.bookmarks;

// Function to retrieve the user's sorting choice from storage
function getSortPreference(callback) {
  chrome.storage.local.get({ folderBefore: false }, (data) => {
    callback(data.folderBefore);
  });
}

function sortAndReorder(parent) {
  if (!parent) return;

  getSortPreference((folderBefore) => {
    // Get the parent folder details
    bm.get(parent, (parentNode) => {
      if (parentNode[0].title === "Bookmarks bar") return; // Skip sorting if inside "Bookmarks bar"

      bm.getChildren(parent, (siblings) => {
        siblings.sort((a, b) => {
          // Ensure "chrome://discards" stays at the very top
          if (a.url === "chrome://discards/") return -1;
          if (b.url === "chrome://discards/") return 1;

          // Determine folder sorting order based on user preference
          if (!a.url && b.url) return folderBefore ? -1 : 1; // a is a folder, b is a bookmark
          if (a.url && !b.url) return folderBefore ? 1 : -1; // a is a bookmark, b is a folder

          // Sort bookmarks in reverse chronological order (newest first)
          return (b.dateAdded || 0) - (a.dateAdded || 0);
        });

        siblings.forEach((sibling, index) => (sibling.index = index));
        siblings.forEach(({ id, index }) => {
          bm.move(id, {
            parentId: parent,
            index: index,
          });
        });
      });
    });
  });
}

// Apply sorting when a bookmark is created
bm.onCreated.addListener((id, bookmark) => {
  sortAndReorder(bookmark.parentId);
});

// Apply sorting when a bookmark is moved
bm.onMoved.addListener((id, moveInfo) => {
  sortAndReorder(moveInfo.parentId);
});

