// reference: https://stackoverflow.com/questions/2661818/javascript-get-xpath-of-a-node
export const createXPathFromElement = (elm: HTMLElement, skipIdSearch: boolean = false) => {
  var allNodes = document.getElementsByTagName("*");
  for (
    var segs = [];
    elm && elm.nodeType == 1;
    elm = elm.parentNode as HTMLElement
  ) {
    if (elm.hasAttribute("id") && !skipIdSearch) {
      var uniqueIdCount = 0;
      for (var n = 0; n < allNodes.length; n++) {
        if (allNodes[n].hasAttribute("id") && allNodes[n].id == elm.id)
          uniqueIdCount++;
        if (uniqueIdCount > 1) break;
      }
      if (uniqueIdCount == 1) {
        segs.unshift('id("' + elm.getAttribute("id") + '")');
        return segs.join("/");
      } else {
        segs.unshift(
          elm.localName.toLowerCase() + '[@id="' + elm.getAttribute("id") + '"]'
        );
      }
    } else {
      let i = 1;
      for (let sib = elm.previousSibling; sib; sib = sib.previousSibling) {
        if (sib instanceof Element && sib.localName == elm.localName) i++;
      }
      segs.unshift(elm.localName.toLowerCase() + "[" + i + "]");
    }
  }
  return segs.length ? "/" + segs.join("/") : null;
};

export const lookupElementByXPath = (path: string) => {
  var evaluator = new XPathEvaluator();
  var result = evaluator.evaluate(
    path,
    document.documentElement,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  return result.singleNodeValue;
};
