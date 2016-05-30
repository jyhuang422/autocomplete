function autocompleteTagWidget(container, dataSet) {
  this._init(container, dataSet);
}

autocompleteTagWidget.prototype = {
  _init: function(container, dataSet) {
    var that = this;
    var currentData = dataSet;
    var tagListMarkup = '<div class="tag-widget__search-container"><input type="text" class="tag-widget__search-input" placeholder="please enter text" autoFocus="true" /><ul class="tag-widget__autocomplete-list"></ul></div>';
    container.className += "tag-widget__container";
    container.innerHTML = tagListMarkup;

    var searchContainerNode = container.getElementsByClassName("tag-widget__search-container")[0];
    var searchInputNode = container.getElementsByClassName("tag-widget__search-input")[0];
    var inputCurrentValue = "";
    var autocompleteListNode = container.getElementsByClassName("tag-widget__autocomplete-list")[0];
    var noResultInputValue = null;
    var cachedResult = {};

    searchInputNode.addEventListener("input", function(e) {
      inputCurrentValue = searchInputNode.value.trim();
      if (inputCurrentValue == "") { 
        autocompleteListNode.style.display = "none";
        autocompleteListNode.innerHTML = "";
        return;
      }
      
      //prevent further search if current value found no result
      if (noResultInputValue && inputCurrentValue.indexOf(noResultInputValue) == 0) return;

      //if there's cached result, use it as data source. or use original data source
      currentData = dataSet;
      var currentCachedKeywordLength = 0;
      for (var cachedKeyword in cachedResult) {
        if (inputCurrentValue.indexOf(cachedKeyword) == 0 && cachedKeyword.length > currentCachedKeywordLength) {
          currentData = cachedResult[cachedKeyword];
          currnetCachedKeywordLength = cachedKeyword.length;
        }
      }

      var searchResult = (inputCurrentValue.length == currentCachedKeywordLength) ? currentData : that._searchItem(inputCurrentValue, currentData);
      var searchResultLength = searchResult.length;
      noResultInputValue = (searchResultLength == 0) ? inputCurrentValue : null;
      cachedResult[inputCurrentValue] = searchResult;
      autocompleteListNode.innerHTML = (searchResultLength > 0) ? that._subMenuMarkup(searchResult, inputCurrentValue) : "";
      autocompleteListNode.style.display = (searchResultLength > 0) ? "block" : "none";
    });

    //do not hide the search list if selecting keyword from it
    searchInputNode.addEventListener("blur", function(e) {
      if (!autocompleteListNode.getElementsByClassName("active")[0]) autocompleteListNode.style.display = "none";
    });

    container.addEventListener("click", function(e) {
      that._tagRomove(e.target, container);
      searchInputNode.focus();
    });

    autocompleteListNode.addEventListener("mouseover", function(e) {
      e.target.classList.add("active");
    });

    autocompleteListNode.addEventListener("mouseout", function(e) {
      e.target.classList.remove("active");
    });

    autocompleteListNode.addEventListener("click", function(e) {
      that._tagInsert(e.target.innerHTML, searchContainerNode, container);
      reset();
    });

    document.addEventListener("keydown", function(e) {
      if (!(searchInputNode == document.activeElement && autocompleteListNode.style.display == "block")) return;

      var keyCode = e.keyCode;
      if (!(keyCode == 40 || keyCode == 38 || keyCode == 13)) return;
      
      var onfocusItem = autocompleteListNode.getElementsByClassName("active")[0];
      var previousItem, nextItem;

      if (keyCode == 40) {
        nextItem = onfocusItem ? onfocusItem.nextSibling : autocompleteListNode.firstChild;
        if (onfocusItem && nextItem) onfocusItem.classList.remove("active");
        if (nextItem) {
          nextItem.classList.add("active");
          searchInputNode.value = nextItem.innerHTML;
        }
      }
      if (keyCode == 38) {
        e.preventDefault();
        if (onfocusItem) {
          previousItem = onfocusItem.previousSibling;
          onfocusItem.classList.remove("active");
          
          if (previousItem) {
            previousItem.classList.add("active");
            searchInputNode.value = previousItem.innerHTML;
          } else {
            searchInputNode.value = inputCurrentValue;
          }
        }
      }
      if (keyCode == 13 && onfocusItem) {
        that._tagInsert(onfocusItem.innerHTML, searchContainerNode, container);
        reset();
      }
    });
    
    function reset() {
      inputCurrentValue = searchInputNode.value = "";
      autocompleteListNode.innerHTML = "";
      autocompleteListNode.style.display = "none";
      searchInputNode.focus();
    }
  },
  _tagInsert: function(inputContent, insertBeforeNode, parentNode) {
    var tagMarkup = document.createElement("span");
    var tagContent = document.createTextNode(inputContent);
    tagMarkup.classList.add("tag-widget__tag-item");
    tagMarkup.appendChild(tagContent);
    parentNode.insertBefore(tagMarkup, insertBeforeNode);
  },
  _tagRomove: function(target, rmFrom) {
    if (target && target.nodeName == "SPAN") rmFrom.removeChild(target);
  },
  _searchItem: function(keyword, dataSet) {
    var dataLength = dataSet.length;
    var keyword = keyword.toUpperCase();
    var matchedDataSet = [];

    for (var i = 0; i < dataLength; i++) {
      var dataItem = dataSet[i];
      if (dataItem.toUpperCase().indexOf(keyword) != -1) matchedDataSet.push(dataItem);
    }

    return matchedDataSet;
  },
  _subMenuMarkup: function(searchResult, inputValue) {
    var searchResultLength = searchResult.length;
    var markup = "";

    if (searchResultLength == 1 && inputValue.toUpperCase() == searchResult[0].toUpperCase()) 
      markup += '<li class="tag-widget__autocomplete-list-item active">'+searchResult[0]+'</li>';
    else {
      for (var i = 0; i < searchResultLength; i++)
        markup += '<li class="tag-widget__autocomplete-list-item">'+searchResult[i]+'</li>';
    }

    return markup;
  }
}