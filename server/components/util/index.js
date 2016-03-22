var Util = {};
Util.updateTreeWithNewPayLoad = function (id, update, tree) {
  if (tree && tree.id == id) {
    tree.items = update;
  } else {
    if(tree.items) {
      tree.items.map(function(item) {
        return Util.updateTreeWithNewPayLoad(id, update, item);
      })
    }
  }
  return tree;
}

Util.updateTreeDeleteItem = function (parentID, fileID, tree) {
  if (tree && tree.id == parentID) {
    tree.items.splice(tree.items.map(function(item){return item.id}).indexOf(fileID), 1);
  } else {
    if(tree && tree.items) {
      tree.items.map(function(item) {
        return Util.updateTreeDeleteItem(parentID, fileID, item);
      })
    }
  }
  return tree;
}
Util.insertItemIntoTree = function (file, parentID, tree) {
  if (tree && tree.id == parentID) {
    file.parentID = parentID;
    tree.items.push(file);
  } else {
    if(tree && tree.items) {
      tree.items.map(function(item) {
        return Util.insertItemIntoTree(file, parentID, item);
      })
    }
  }
  return tree;
}

export default Util
