// validator define for different press
const validators = "__PRESS_CONFIG__";

validators["10.1006"] = validators["10.1016"];
validators["10.1149"] = validators["10.1088"];

const documentFixer = {
  10.1088: (document) => {
    const imgs = Array.from(
      document.querySelectorAll('main figure img[data-src^="http"]')
    );
    imgs.forEach((item) => {
      item.src = item.dataset.src;
    });
  },
  10.3389: (document) => {
    const imgs = Array.from(
      document.querySelectorAll(
        '.article-container .JournalFullText .FigureDesc img[data-src^="http"]'
      )
    );
    imgs.forEach((item) => {
      item.src = item.dataset.src;
    });
  },
};
documentFixer["10.1149"] = documentFixer["10.1088"];
