import React from "react";

export default function LanguageSwitch({ lang, setLang }) {
  return (
    <div className="language-switch">
      <button onClick={() => setLang("vn")} className={lang==="vn"?"active":""}>🇻🇳</button>
      <button onClick={() => setLang("tw")} className={lang==="tw"?"active":""}>🇹🇼</button>
      <button onClick={() => setLang("en")} className={lang==="en"?"active":""}>🇬🇧</button>
    </div>
  );
}