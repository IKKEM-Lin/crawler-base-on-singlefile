// validator define for different press
const validators = {
    1002: (document) =>
      (document.querySelector(
        ".article__body .abstract-group .article-section__abstract .article-section__content"
      ) || document.querySelector("article .abstract-group")) &&
      document.querySelectorAll(
        ".article__body .article-section__full :where(.article-section__content > p, .article-section__sub-content > p)"
      ).length > 0,
    1016: (document) =>
      (document.querySelector("div.abstract.author > div") ||
        document.querySelector('[data-left-hand-nav="Summary"]')  || document.querySelector("article #author-abstract [id^=abspara]")) &&
      (document.querySelectorAll(
        "div#body > div:first-child > section[id^=s] p[id^=p]"
      ).length > 0 ||
        document.querySelectorAll(
          "div#body > div:first-child  :where(section[id^=aep-section] > p, section[id^=aep-section] div > p)"
        ).length > 0 ||
        document.querySelectorAll("[id^='sec'] .section-paragraph").length > 0 || 
        document.querySelectorAll("div#body [id^='sec'] p[id^='par']").length > 0  || document.querySelectorAll('article #bodymatter [id^=sec-] [role="paragraph"]').length > 0 || document.querySelectorAll("div#body section[id^='s'] [id^='p']").length > 0),
    3390: (document) =>
      document.querySelector("#html-abstract .html-p") &&
      document.querySelectorAll("article .html-body .html-p").length > 0,
    1039: (document) =>
      document.querySelector("article .capsule__text") &&
      document.querySelectorAll("#pnlArticleContentLoaded > p").length > 0,
    1021: (document) =>
      (document.querySelector("p.articleBody_abstractText") || document.querySelector("#specialIssueNotice") || document.querySelector('meta[name="dc.Type"]')?.content === 'review-article') &&
      (document.querySelectorAll("div.NLM_p").length > 0 ||
        document.querySelectorAll(".article_content-left > p").length > 0),
    1038: (document) =>
      (document.querySelector("#Abs1-content") || document.querySelector('article [data-title="Abstract"]')) &&
      document.querySelectorAll(
        "article .main-content .c-article-section__content > p"
      ).length > 0,
    1007: (document) =>
      document.querySelectorAll("#Abs1-content p").length > 0 &&
      document.querySelectorAll(".main-content .c-article-section__content > p")
        .length > 0,
    1088: (document) =>
      document.querySelectorAll(".wd-jnl-art-abstract > p").length > 0 &&
      document.querySelectorAll(`:where( 
          div[itemprop="articleBody"] >  p, 
          div[itemprop="articleBody"] > .article-text > p, 
          div[itemprop="articleBody"] > .article-text > .article-text > p,
          div[itemprop="articleBody"] > .article-text > .article-text > .article-text > p)
      `).length > 0,
    1063: (document) =>
      document.querySelectorAll("#ContentTab .abstract p").length > 0 &&
      document.querySelectorAll("#ContentTab .article-section-wrapper > p")
        .length > 0,
    1126: (document) =>
      document.querySelectorAll('[role="doc-abstract"] > [role="paragraph"]')
        .length > 0 &&
      document.querySelectorAll(`#bodymatter [role="paragraph"]`).length > 0,
  
    // Cancel "1155" because of CSP, need to fix "fetch-url2.deno.dev" fetch 
    // const addScript = async (url) => {
    //   const s = document.createElement("script");
    //   const res = await GM.xmlHttpRequest({
    //     url: url,
    //     method: "GET",
    //   });
  
    //   const text = res.responseText;
    //   s.innerHTML = text;
    //   document.body.append(s);
    // };
  
    // 1155: (document) =>
    //   document.querySelector(".articleBody #abstract") &&
    //   document.querySelectorAll(".articleBody .xml-content > p:not(#abstract + p)").length > 0,
    1074: (document) =>
      document.querySelector('.article__sections section:first-child:not(section[id^="cesec"])') &&
      document.querySelectorAll('.article__sections section[id^="cesec"] > .section-paragraph').length > 0,
    3389: (document) =>
      document.querySelector('.JournalAbstract .authors+.notes+p') &&
      document.querySelectorAll('.article-container .JournalFullText > p').length > 0,
    1186: (document) =>
      document.querySelector('[data-title="Abstract"] .c-article-section__content') &&
      document.querySelectorAll('main > article > section:not([data-title="Abstract"]):not(#MagazineFulltextArticleBodySuffix ~ section) .c-article-section__content > p').length > 0,
    3762: (document) =>
      document.querySelector('#articleContent #abstract p') &&
      document.querySelectorAll('#articleContent .text-bs > p').length > 0,
    1371: (document) =>
      document.querySelector('.article-content .abstract-content p') &&
      document.querySelectorAll('.article-content #artText div[id^="section"] > p').length > 0,
  };
  
  validators["1006"] = validators["1016"];
  validators["1149"] = validators["1088"];
  
  const documentFixer = {
    1088: (document) => {
      const imgs = Array.from(
        document.querySelectorAll('main figure img[data-src^="http"]')
      );
      imgs.forEach((item) => {
        item.src = item.dataset.src;
      });
    },
    3389: (document) => {
      const imgs = Array.from(
        document.querySelectorAll('.article-container .JournalFullText .FigureDesc img[data-src^="http"]')
      );
      imgs.forEach((item) => {
        item.src = item.dataset.src;
      });
    },
  };
  documentFixer["1149"] = documentFixer["1088"];
