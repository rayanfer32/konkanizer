const getTranslation = async (q: string) => {
    const resp = await fetch("http://www.thekonkanidictionary.com/search.asp", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.7",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
      },
      body: `sword=${q}&B1=Submit`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
  
    const htmlData = await resp.text();
  
    document.querySelector("body").innerHTML = htmlData.slice(
      htmlData.indexOf("<body"),
      htmlData.indexOf("</body>")
    );
  
    const tempObj = {};
  
    document.querySelectorAll(".head2").forEach((el, index) => {
      const tdString = el.parentElement.innerText;
      const transString = tdString
        .slice(tdString.indexOf("</span>") + 7, tdString.length)
        .split("\n")
        .filter((el) => el !== "")
        .map((el) => el.trim());
      if (index == 0) {
        tempObj["noun"] = transString;
      }
      if (index == 1) {
        tempObj["verb"] = transString;
      }
    });
  
    return tempObj;
  };
  
  const enLyrics = `Tell me your story
  And I'll tell you mine`;
  
  const translation = [];
  
  let tokens = enLyrics.split("\n").map((line) =>
    line.split(" ").map((word) => {
      return {
        en: word,
        translation: null,
      };
    })
  );
  
  tokens.forEach((line, index) => {
    setTimeout(() => {
      line.forEach(async (word) => {
        word.translation = await getTranslation(word.en);
      });
    }, index * 1000);
  });
  
  console.log(tokens);
  