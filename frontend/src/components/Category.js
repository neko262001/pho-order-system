import React from "react";

export default function Category({ categories, lang, selected, setSelected }) {
  return (
    <div className="categories">
      {categories.map(cat => (
        <button
          key={cat.id}
          className={selected===cat.id?"active":""}
          onClick={() => setSelected(cat.id)}
        >
          {cat.name[lang]}
        </button>
      ))}
    </div>
  );
}