import { useState } from "react";
import FoodSearch from "./FoodSearch";
import LabelImport from "./LabelImport";
import OffSearch from "./OffSearch";
import RecipesCard from "./RecipesCard";
import { useI18n } from "../i18n/context";

/** One tabbed panel for every way of adding products, instead of four stacked sections. */
export default function AddPanel({ products, names, recipes, setRecipes, onAdd, onAddMany, notify }) {
  const { t } = useI18n();
  const [tab, setTab] = useState("foods");
  const tabs = [
    ["foods", t("panel.foods")],
    ["online", t("panel.online")],
    ["label", t("panel.label")],
    ["recipes", `${t("panel.recipes")}${recipes.length ? ` (${recipes.length})` : ""}`]
  ];

  return (
    <section className="glass-card add-panel">
      <div className="panel-tabs" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "foods" && <FoodSearch existingNames={names} onAdd={onAdd} onAddMany={onAddMany} notify={notify} />}
      {tab === "online" && <OffSearch onAdd={onAdd} />}
      {tab === "label" && <LabelImport existingNames={names} onAdd={onAdd} />}
      {tab === "recipes" && <RecipesCard recipes={recipes} setRecipes={setRecipes} products={products} notify={notify} />}
    </section>
  );
}
