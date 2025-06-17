
const bm = chrome.bookmarks;

// Function to retrieve the user's sorting choice from storage
function getSortPreference(callback) {
  chrome.storage.local.get({ folderBefore: false }, (data) => {
    callback(data.folderBefore);
  });
}

// Function to check if sorting should apply globally
function shouldSortAll(callback) {
  chrome.storage.local.get({ sortAll: true }, (data) => {
    callback(data.sortAll);
  });
}

// Function to check if Bookmarks Bar should be sorted
function shouldExcludeBB(callback) {
  chrome.storage.local.get({ excludeBB: false }, (data) => {
    callback(data.excludeBB);
  });
}

// NOTES:
// Does not sort bookmarks inside "Bookmarks bar"
// Does not sort folders (Folders stay near the top, or near bottom)
// "chrome://discards" always stays at the top
// All other bookmarks sorted in reverse chronological order (newest first) 
function sortAndReorder(parent) {
  if (!parent) return;

  getSortPreference((folderBefore) => {
    // Get the parent folder details
    bm.get(parent, (parentNode) => {
      shouldExcludeBB((excludeBB) => {
        if (parentNode[0].title === "Bookmarks bar" && excludeBB) return; // Skip sorting if inside "Bookmarks bar"

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
  });
}

// Function to move a new bookmark near the top (without sorting)
function moveNearTop(bookmark) {
  const parent = bookmark.parentId;
  if (!parent) return;

  // Check whether we should include Bookmarks Bar
  shouldExcludeBB((excludeBB) => {
    bm.get(parent, (parentNode) => {
      // Skip moving if not including Bookmarks Bar and we're inside it
      if (parentNode[0].title === "Bookmarks bar" && excludeBB) return; // Skip sorting if inside "Bookmarks bar"

      bm.getChildren(parent, (siblings) => {
        let newIndex = 0;

        // Ensure "chrome://discards" stays at the top
        if (siblings.some((b) => b.url === "chrome://discards/")) {
          newIndex = 1;
        }

        // Count folders (if folderBefore is true)
        getSortPreference((folderBefore) => {
          if (folderBefore) {
            let folderCount = siblings.filter((b) => !b.url).length;
            newIndex += folderCount;
          }

          bm.move(bookmark.id, { parentId: parent, index: newIndex });
        });
      });
    });
  });
}

// Apply sorting when a bookmark is created
bm.onCreated.addListener((id, bookmark) => {
  shouldSortAll((sortAll) => {
    if (sortAll) {
      sortAndReorder(bookmark.parentId);
    } else {
      moveNearTop(bookmark);
    }
  });
});

// Apply sorting when a bookmark is moved
bm.onMoved.addListener((id, moveInfo) => {
  shouldSortAll((sortAll) => {
    if (sortAll) {
      sortAndReorder(moveInfo.parentId);
    } 
    else {
      bm.get(id, (results) => {
        const bookmark = results[0];
        if (bookmark) {
          moveNearTop(bookmark);
        }
      });
    }
  });
});

