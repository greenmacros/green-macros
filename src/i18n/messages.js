// Every UI string lives here as { en, ja }. Use {name} for variables.
// A test (i18n.test.js) checks that every key used in the source exists with both languages.
const m = (en, ja) => ({ en, ja });

export const MESSAGES = {
  /* common */
  "common.close": m("Close", "閉じる"),
  "common.delete": m("Delete", "削除"),
  "common.duplicate": m("Duplicate", "複製"),
  "common.loading": m("Loading…", "読み込み中…"),
  "common.rename": m("Rename", "名前を変更"),
  "common.undo": m("Undo", "元に戻す"),

  /* tabs / days */
  "tab.planner": m("Plan", "プラン"),
  "tab.week": m("Week", "週間"),
  "tab.products": m("Products", "食品"),
  "day.0": m("Mon", "月"),
  "day.1": m("Tue", "火"),
  "day.2": m("Wed", "水"),
  "day.3": m("Thu", "木"),
  "day.4": m("Fri", "金"),
  "day.5": m("Sat", "土"),
  "day.6": m("Sun", "日"),

  /* macros & units */
  "macro.cal": m("Cal", "kcal"),
  "macro.p": m("P", "P"),
  "macro.c": m("C", "C"),
  "macro.f": m("F", "F"),
  "macro.calories": m("Calories", "カロリー"),
  "macro.protein": m("Protein", "たんぱく質"),
  "macro.carbs": m("Carbs", "炭水化物"),
  "macro.fat": m("Fat", "脂質"),
  "unit.kcal": m("kcal", "kcal"),
  "unit.g": m("g", "g"),
  "unit.ml": m("ml", "ml"),
  "unit.unit": m("unit", "個"),
  "unit.scoop": m("scoop", "杯"),

  /* default names */
  "plan.default": m("Plan", "プラン"),
  "meal.default": m("Meal", "食事"),
  "plan.copyOf": m("{name} copy", "{name} のコピー"),
  "starter.workoutDay": m("Workout Day", "トレーニング日"),
  "starter.restDay": m("Rest Day", "休養日"),
  "starter.breakfast": m("Breakfast", "朝食"),
  "starter.lunch": m("Lunch", "昼食"),
  "starter.postWorkout": m("Post Workout", "トレ後"),
  "starter.dinner": m("Dinner", "夕食"),

  /* first run / share import */
  "first.title": m("Welcome to GreenMacros 🌱", "GreenMacros へようこそ 🌱"),
  "first.tool": m(
    "GreenMacros is a flexible planning tool — not a diet prescription.",
    "GreenMacros は自由に使える計画ツールです。食事療法の指示ではありません。"
  ),
  "first.choose": m(
    "Start completely fresh, or load a few common plant-based foods and two empty day templates you can customize.",
    "まっさらな状態で始めるか、よく使う植物性食品といくつかの1日テンプレートを読み込めます。"
  ),
  "first.fresh": m("Start fresh", "最初から始める"),
  "first.preset": m("Load preset", "プリセットを読み込む"),
  "first.note": m(
    "Presets contain approximate nutrition values and no macro targets — verify against real labels.",
    "プリセットの栄養値は目安です。目標値は含まれません。実際の表示でご確認ください。"
  ),
  "share.title": m("Shared plan received", "共有されたプランがあります"),
  "share.body": m(
    "This link contains {plans} plan(s) ({names}) and {products} product(s).",
    "このリンクには {plans} 件のプラン（{names}）と {products} 件の食品が含まれています。"
  ),
  "share.merge": m("Add to my plans", "自分のプランに追加"),
  "share.replace": m("Replace everything", "すべて置き換える"),
  "share.ignore": m("Ignore link", "リンクを無視"),
  "share.note": m(
    "“Add” keeps all your current plans and products. “Replace” overwrites them with the shared data.",
    "「追加」は今のプランと食品を残します。「置き換え」は共有データで上書きします。"
  ),
  "share.button": m("Share", "共有"),
  "share.copyCurrent": m("Copy link — current plan", "リンクをコピー — 現在のプラン"),
  "share.copyAll": m("Copy link — all {n} plans", "リンクをコピー — 全 {n} プラン"),

  /* backup menu */
  "backup.title": m("Backup & restore", "バックアップと復元"),
  "backup.exportProducts": m("Export products", "食品を書き出す"),
  "backup.exportPlans": m("Export plans", "プランを書き出す"),
  "backup.exportAll": m("Export full backup", "完全バックアップを書き出す"),
  "backup.importProducts": m("Import products…", "食品を読み込む…"),
  "backup.importPlans": m("Import plans…", "プランを読み込む…"),
  "backup.restore": m("Restore full backup…", "完全バックアップを復元…"),
  "backup.install": m("Install app", "アプリをインストール"),
  "kind.products": m("products", "食品"),
  "kind.plans": m("plans", "プラン"),
  "kind.all": m("backup", "バックアップ"),

  /* footer */
  "footer.line": m("Free & open source · No accounts, no tracking", "無料・オープンソース・アカウント不要・トラッキングなし"),

  /* toasts */
  "toast.badLink": m("That shared link couldn't be read.", "共有リンクを読み取れませんでした。"),
  "toast.saveFail": m(
    "Couldn't save to this browser — export a backup to keep your data.",
    "このブラウザに保存できません。バックアップを書き出してください。"
  ),
  "toast.copyFail": m("Couldn't copy the link", "リンクをコピーできませんでした"),
  "toast.linkLong": m("Link copied — it's long, some apps may cut it off", "リンクをコピーしました（長いため一部のアプリで途切れる場合があります）"),
  "toast.linkCopied": m("Link copied!", "リンクをコピーしました！"),
  "toast.sharedAdded": m("Added {n} plan(s)", "{n} 件のプランを追加しました"),
  "toast.sharedReplaced": m("Replaced with shared plans", "共有プランに置き換えました"),
  "toast.importedProducts": m("Imported {n} products", "{n} 件の食品を読み込みました"),
  "toast.importedPlans": m("Plans imported", "プランを読み込みました"),
  "toast.badFile": m("That doesn't look like a valid {kind} file", "有効な{kind}ファイルではありません"),
  "toast.planDeleted": m("Deleted “{name}”", "「{name}」を削除しました"),
  "toast.mealRemoved": m("Removed “{name}”", "「{name}」を削除しました"),
  "toast.mealCleared": m("Cleared “{name}”", "「{name}」を空にしました"),
  "toast.scaled": m("Scaled to {macro} target (×{factor})", "{macro}の目標に合わせて調整しました（×{factor}）"),
  "toast.copiedText": m("Plan copied as text", "プランをテキストでコピーしました"),
  "toast.clipboardFail": m("Couldn't access the clipboard", "クリップボードにアクセスできません"),
  "toast.productAdded": m("Added “{name}”", "「{name}」を追加しました"),
  "toast.productDeleted": m("Deleted “{name}”", "「{name}」を削除しました"),
  "toast.starterAdded": m("Added {n} starter products", "{n} 件のスターター食品を追加しました"),
  "toast.starterHave": m("Starter products are already in your list", "スターター食品はすでにリストにあります"),
  "toast.allDeleted": m("All products deleted", "すべての食品を削除しました"),
  "toast.recipeSaved": m("Saved recipe “{name}”", "レシピ「{name}」を保存しました"),
  "toast.recipeAdded": m("Added “{name}”", "「{name}」を追加しました"),
  "toast.recipeAddedSkipped": m("Added “{name}” ({n} item(s) skipped — product missing)", "「{name}」を追加しました（食品が見つからない {n} 件はスキップ）"),
  "toast.recipeEmpty": m("None of this recipe's products exist any more", "このレシピの食品はすべて削除されています"),
  "toast.recipeDeleted": m("Deleted recipe “{name}”", "レシピ「{name}」を削除しました"),

  /* plan tabs */
  "plans.all": m("All plans", "すべてのプラン"),
  "plans.search": m("Search {n} plans…", "{n} 件のプランを検索…"),
  "plans.noMatch": m("No plans match.", "該当するプランがありません。"),
  "plans.tabHint": m("Double-click to rename · drag to reorder", "ダブルクリックで名前変更・ドラッグで並べ替え"),
  "plans.new": m("New plan", "新しいプラン"),
  "plans.actions": m("Plan actions", "プランの操作"),
  "plans.moveLeft": m("Move left", "左へ移動"),
  "plans.moveRight": m("Move right", "右へ移動"),
  "plans.color": m("Set color", "色を設定"),
  "plans.noColor": m("No color", "色なし"),
  "plans.shareThis": m("Copy share link (this plan)", "共有リンクをコピー（このプラン）"),
  "plans.copyText": m("Copy as text", "テキストでコピー"),
  "plans.csvThis": m("Export this plan (CSV)", "このプランを書き出す（CSV）"),
  "plans.csvAll": m("Export all plans (CSV)", "全プランを書き出す（CSV）"),
  "plans.delete": m("Delete plan", "プランを削除"),

  /* planner & meals */
  "planner.noProducts": m("No products yet.", "食品がまだありません。"),
  "planner.noProductsHint": m(
    "Add some foods first, or create one straight from the “＋ Add item” menu below.",
    "先に食品を追加するか、下の「＋ 食品を追加」メニューからその場で作成できます。"
  ),
  "planner.addProducts": m("Add products", "食品を追加"),
  "meal.name": m("Meal name", "食事名"),
  "meal.actions": m("Meal actions", "食事の操作"),
  "meal.addBelow": m("Add meal below", "下に食事を追加"),
  "meal.moveUp": m("Move up", "上へ移動"),
  "meal.moveDown": m("Move down", "下へ移動"),
  "meal.setTarget": m("Set meal target…", "この食事の目標を設定…"),
  "meal.hideTarget": m("Hide meal target", "目標を隠す"),
  "meal.target": m("Target", "目標"),
  "meal.saveRecipe": m("Save as recipe…", "レシピとして保存…"),
  "meal.clear": m("Clear items", "食品をすべて外す"),
  "meal.remove": m("Remove meal", "食事を削除"),
  "meal.item": m("Item", "食品"),
  "meal.amount": m("Amount", "量"),
  "meal.removeItem": m("Remove item", "食品を外す"),
  "meal.lockHint": m("Lock amount (excluded from auto-fill)", "量を固定（自動調整の対象外）"),
  "meal.lockedHint": m("Locked: auto-fill won't change this", "固定中：自動調整で変わりません"),
  "meal.addItem": m("+ Add item", "+ 食品を追加"),
  "meal.addRecipe": m("Add recipe", "レシピを追加"),
  "meal.addMealBtn": m("+ Add meal", "+ 食事を追加"),
  "meal.newMeal": m("New Meal", "新しい食事"),

  /* picker */
  "picker.choose": m("Choose product…", "食品を選択…"),
  "picker.missing": m("⚠ Missing product", "⚠ 食品が見つかりません"),
  "picker.search": m("Search products…", "食品を検索…"),
  "picker.noMatch": m("No match.", "該当なし。"),
  "picker.noProducts": m("No products yet.", "食品がまだありません。"),
  "picker.new": m("＋ New product…", "＋ 新しい食品…"),
  "picker.newNamed": m("＋ New product “{name}”…", "＋ 新しい食品「{name}」…"),

  /* summary */
  "summary.title": m("Targets & Totals", "目標と合計"),
  "summary.target": m("Target", "目標"),
  "summary.actual": m("Actual", "実績"),
  "summary.remaining": m("Remaining", "残り"),
  "summary.over": m("+{n} over", "+{n} 超過"),
  "summary.autofill": m("Auto-fill", "自動調整"),
  "summary.macroToHit": m("Macro to hit", "合わせる栄養素"),
  "summary.scale": m("Scale unlocked items to hit target", "固定していない食品の量を目標に合わせて調整"),
  "summary.lockedStay": m("locked items stay as they are.", "固定した食品はそのままです。"),
  "auto.noTarget": m("Set a target first.", "先に目標を設定してください。"),
  "auto.noContribution": m("No unlocked items contribute to that macro.", "その栄養素を含む未固定の食品がありません。"),
  "auto.lockedExceed": m("Locked items already exceed that target.", "固定した食品だけで目標を超えています。"),

  /* week */
  "week.title": m("Week", "週間プラン"),
  "week.help": m(
    "Assign one of your plans to each day to see weekly totals and averages.",
    "各曜日にプランを割り当てると、週の合計と平均が分かります。"
  ),
  "week.clear": m("Clear week", "週をクリア"),
  "week.rest": m("— Rest —", "— 休み —"),
  "week.open": m("Open plan", "プランを開く"),
  "week.summary": m("Weekly summary", "週の集計"),
  "week.none": m("Assign at least one plan to a day.", "少なくとも1日にプランを割り当ててください。"),
  "week.total": m("Total", "合計"),
  "week.avg": m("Daily avg ({n} days)", "1日平均（{n}日）"),

  /* products tab */
  "products.title": m("Products", "食品"),
  "products.add": m("+ Add product", "＋ 食品を追加"),
  "products.hideForm": m("Hide form", "フォームを閉じる"),
  "products.starter": m("Add starter products", "スターター食品を追加"),
  "products.deleteAll": m("Delete all", "すべて削除"),
  "products.search": m("Search {n} products…", "{n} 件の食品を検索…"),
  "products.favorites": m("Favorites", "お気に入り"),
  "products.sort": m("Sort", "並べ替え"),
  "products.colServing": m("Serving", "基準量"),
  "products.favHint": m("Favorite (shown first in pickers)", "お気に入り（選択メニューの先頭に表示）"),
  "products.usedIn": m("in {n} item(s)", "{n} 件で使用中"),
  "products.kcalOff": m(
    "Calories don't match macros (≈{n} kcal). Click to use that.",
    "カロリーが栄養素と一致しません（約 {n} kcal）。クリックで反映。"
  ),
  "products.noMatch": m("No products match your filters.", "条件に合う食品がありません。"),
  "products.empty": m(
    "No products yet — add one above, search the food list, or paste a label.",
    "食品がありません。上から追加するか、食品リストを検索、またはラベルを貼り付けてください。"
  ),
  "products.confirmUsed": m("“{name}” is used in {n} item(s). Delete it anyway?", "「{name}」は {n} 件で使われています。それでも削除しますか？"),
  "products.confirmAll": m(
    "Delete all {n} products? Plans using them will show “Missing product”.",
    "{n} 件の食品をすべて削除しますか？プラン内では「食品が見つかりません」と表示されます。"
  ),
  "products.disclaimer": m(
    "Built-in values are approximate. Always verify against the nutrition label. GreenMacros is a planning tool, not medical advice.",
    "内蔵の数値は目安です。必ず栄養成分表示でご確認ください。GreenMacros は計画用ツールで、医療上のアドバイスではありません。"
  ),
  "sort.name": m("Name (A–Z)", "名前順"),
  "sort.recent": m("Newest first", "新しい順"),
  "sort.protein": m("Protein (high → low)", "たんぱく質（多い順）"),
  "sort.carbs": m("Carbs (high → low)", "炭水化物（多い順）"),
  "sort.fat": m("Fat (high → low)", "脂質（多い順）"),
  "sort.cal": m("Calories (high → low)", "カロリー（高い順）"),

  /* product form */
  "form.name": m("Name", "名前"),
  "form.namePlaceholder": m("e.g. Seitan", "例：セイタン"),
  "form.serving": m("Serving size", "基準量"),
  "form.unit": m("Unit", "単位"),
  "form.protein": m("Protein (g)", "たんぱく質 (g)"),
  "form.carbs": m("Carbs (g)", "炭水化物 (g)"),
  "form.fat": m("Fat (g)", "脂質 (g)"),
  "form.calories": m("Calories", "カロリー"),
  "form.autoKcal": m("Auto-calculate calories", "カロリーを自動計算"),
  "form.duplicate": m("A product with this name already exists.", "同じ名前の食品がすでにあります。"),
  "form.per": m("All values are per {amount} {unit}.", "数値はすべて {amount} {unit} あたり。"),
  "form.add": m("Add product", "食品を追加"),

  /* food database */
  "foods.search": m("Search in English or Japanese — e.g. natto, 豆腐, とうふ", "日本語・英語で検索（例：納豆、tofu、とうふ）"),
  "foods.region": m("Region", "地域"),
  "foods.all": m("All foods", "すべて"),
  "foods.jp": m("Japan", "日本"),
  "foods.global": m("Global", "海外"),
  "foods.none": m("No results.", "見つかりません。"),
  "foods.per100": m("per 100 g", "100gあたり"),
  "foods.add": m("Add", "追加"),
  "foods.added": m("✓ Added", "✓ 追加済み"),
  "foods.importCsv": m("Import food CSV…", "食品CSVを読み込む…"),
  "foods.csvHint": m(
    "Need a bigger database? Import a CSV (name, kcal, protein, carbs, fat — per 100 g). Japanese headers like 食品名・エネルギー・たんぱく質・炭水化物・脂質 work too. Official data:",
    "もっと多くの食品が必要ですか？CSV（名前・kcal・たんぱく質・炭水化物・脂質／100gあたり）を読み込めます。食品名・エネルギー・たんぱく質・炭水化物・脂質などの日本語見出しにも対応。公式データ："
  ),
  "foods.mext": m("MEXT food composition tables", "日本食品標準成分表（文部科学省）"),
  "foods.approx": m(
    "Values are rounded approximations of the Japan Standard Tables of Food Composition and USDA data. Verify against package labels.",
    "数値は日本食品標準成分表およびUSDAデータを丸めた目安です。パッケージの表示をご確認ください。"
  ),
  "foods.csvNothing": m("No new foods found in that file", "ファイルに新しい食品はありませんでした"),
  "foods.csvDone": m("Imported {n} foods ({skipped} skipped)", "{n} 件の食品を読み込みました（{skipped} 件スキップ）"),
  "foods.csvBad": m(
    "Couldn't read that CSV. It needs a header row with a name column.",
    "CSVを読み取れませんでした。名前の列を含む見出し行が必要です。"
  ),

  /* Open Food Facts */
  "off.placeholder": m("e.g. oat milk, 納豆, tempeh…", "例：豆乳、納豆、oat milk…"),
  "off.search": m("Search", "検索"),
  "off.searching": m("Searching…", "検索中…"),
  "off.import": m("Import", "取り込む"),
  "off.error": m(
    "Couldn't reach Open Food Facts. Check your connection and try again.",
    "Open Food Facts に接続できません。通信状況を確認してもう一度お試しください。"
  ),

  /* label import */
  "label.placeholder": m(
    "Seitan Strips\nServing size 85g\nCalories 120\nProtein 21g\nTotal Carbohydrate 4g\nTotal Fat 2g",
    "大豆ミート\n1食分 85g\nエネルギー 120kcal\nたんぱく質 21g\n脂質 2g\n炭水化物 4g"
  ),
  "label.read": m("Read label", "読み取る"),
  "label.missing": m("Couldn't find: {fields}. Fill them in below.", "見つかりません：{fields}。下で入力してください。"),
  "label.assumed": m("No serving size found — assuming 100. Adjust if needed.", "基準量が見つからないため 100 としています。必要なら修正してください。"),

  /* recipes */
  "recipe.name": m("Recipe name", "レシピ名"),
  "recipe.namePrompt": m("Recipe name?", "レシピ名は？"),
  "recipe.empty": m(
    "No recipes yet. Build a meal in the Plan tab, then use its ⋯ menu → “Save as recipe…”.",
    "レシピはまだありません。プランタブで食事を作り、⋯メニューの「レシピとして保存…」を使ってください。"
  ),
  /* theme, print, image */
  "theme.toDark": m("Switch to dark mode", "ダークモードに切り替え"),
  "theme.toLight": m("Switch to light mode", "ライトモードに切り替え"),
  "plans.image": m("Save as image (PNG)", "画像として保存（PNG）"),
  "plans.print": m("Print…", "印刷…"),
  "week.print": m("Print", "印刷"),
  "toast.imageSaved": m("Image saved", "画像を保存しました"),
  "toast.imageFail": m("Couldn't create the image", "画像を作成できませんでした"),
  "image.disclaimer": m(
    "Made with GreenMacros — a planning tool, not medical advice. Verify values against product labels.",
    "GreenMacros で作成 — 計画用ツールであり、医療上のアドバイスではありません。数値は商品の表示でご確認ください。"
  ),

  /* advice label (shown with every generated suggestion) */
  "advice.title": m("Suggestion only — not medical or nutrition advice", "あくまで提案です — 医療・栄養指導ではありません"),
  "advice.short": m(
    "These amounts are a mathematical estimate based on the nutrition values stored in your product list, which may be inaccurate or out of date.",
    "この量は、食品リストに登録された栄養値をもとにした計算上の目安です。数値が不正確・古い場合があります。"
  ),
  "advice.long": m(
    "It does not know your health, allergies, medications or needs. If you have a medical condition, are pregnant or breastfeeding, are under 18, have or have had an eating disorder, or follow a medically supervised diet, talk to a doctor or registered dietitian before using it. Check the amounts yourself — very large or very small portions may be unsuitable — and never rely on it for allergen safety.",
    "あなたの健康状態、アレルギー、服薬、必要量は考慮されていません。持病がある方、妊娠・授乳中の方、18歳未満の方、摂食障害の経験がある方、医師の管理下で食事制限をしている方は、ご利用前に医師または管理栄養士にご相談ください。量は必ずご自身で確認してください（極端に多い・少ない量は不適切な場合があります）。アレルゲンの安全確認には使用しないでください。"
  ),
  "advice.ack": m("I understand this is a suggestion, not medical advice.", "これは提案であり、医療上のアドバイスではないことを理解しました。"),
  "advice.needAck": m("Tick the box above to continue.", "続けるには上のチェックを入れてください。"),

  /* meal builder */
  "builder.button": m("Build from products", "食品から食事を作る"),
  "builder.title": m("Make a meal with these products", "選んだ食品で食事を作る"),
  "builder.intro": m(
    "Pick the products you want to eat and a target — GreenMacros suggests amounts for “{meal}”.",
    "食べたい食品と目標を選ぶと、「{meal}」の量を提案します。"
  ),
  "builder.pick": m("Choose products", "食品を選ぶ"),
  "builder.favs": m("Favorites only", "お気に入りのみ"),
  "builder.none": m("Clear", "選択解除"),
  "builder.selected": m("{n} selected", "{n} 件選択中"),
  "builder.targets": m("Target for this meal", "この食事の目標"),
  "builder.source.meal": m("Using this meal's target.", "この食事の目標を使用しています。"),
  "builder.source.remaining": m("Prefilled with what's left of today's plan target. Edit freely.", "今日のプラン目標の残りを入力済みです。自由に編集できます。"),
  "builder.source.none": m("Enter what you want this meal to provide (leave a field blank to ignore it).", "この食事で摂りたい量を入力してください（空欄の項目は無視されます）。"),
  "builder.maxServings": m("Max per item", "1品の上限"),
  "builder.generate": m("Suggest amounts", "量を提案する"),
  "builder.regenerate": m("Recalculate", "再計算"),
  "builder.needInput": m("Select at least one product and enter at least one target.", "食品を1つ以上選び、目標を1つ以上入力してください。"),
  "builder.result": m("Suggested amounts", "提案された量"),
  "builder.close": m("Within 10% of your target.", "目標の±10%以内です。"),
  "builder.short": m("Couldn't reach: {macros} is too low with these products — try adding a product rich in it.", "目標に届きません：これらの食品では {macros} が不足します。それを多く含む食品を追加してみてください。"),
  "builder.over": m("{macros} ends up above target — these products carry more of it than your target allows.", "{macros} が目標を超えます。選んだ食品に多く含まれています。"),
  "builder.maxed": m("Uses a very large amount of: {names}. Consider adding other products.", "次の食品が非常に多い量になっています：{names}。他の食品の追加をご検討ください。"),
  "builder.dropped": m("Left out (not needed for the target): {names}.", "目標に不要なため除外：{names}。"),
  "builder.replace": m("Replace this meal's unlocked items", "この食事の未固定の食品を置き換える"),
  "builder.add": m("Add to “{meal}”", "「{meal}」に追加"),
  "toast.builderAdded": m("Suggested items added — check the amounts", "提案された食品を追加しました。量をご確認ください"),
  /* data-safety notices */
  "notice.ios": m(
    "On iPhone, Safari can erase this app's saved plans if you don't open it for about a week. To keep them safe: tap Share, then “Add to Home Screen”, and open GreenMacros from there. A backup also helps.",
    "iPhoneのSafariでは、1週間ほど開かないと保存したプランが消えることがあります。共有ボタン →「ホーム画面に追加」で追加し、そこから開くと安全です。バックアップも有効です。"
  ),
  "notice.gotIt": m("Got it", "わかりました"),
  "notice.later": m("Not now", "あとで"),
  "notice.backupNever": m("You haven't backed up yet.", "まだバックアップしていません。"),
  "notice.backupOld": m("Your last backup was {n} days ago.", "最後のバックアップは {n} 日前です。"),
  "notice.backupWhy": m(
    "Your plans are saved only in this browser, so clearing site data or switching devices would lose them.",
    "プランはこのブラウザ内にのみ保存されています。サイトデータの消去や端末の変更で失われます。"
  ),
  "notice.backupNow": m("Back up now", "今すぐバックアップ"),
  "notice.backedUp": m("Backup downloaded — keep the file somewhere safe", "バックアップをダウンロードしました。ファイルを安全な場所に保管してください"),
  "backup.last": m("Last full backup: {when} ({n} d ago)", "最後の完全バックアップ：{when}（{n}日前）"),
  "backup.lastNever": m("No full backup yet", "完全バックアップはまだありません"),
  /* settings & panels */
  "settings.title": m("Settings", "設定"),
  "settings.language": m("Language", "言語"),
  "products.more": m("More", "その他"),
  "summary.details": m("Details", "詳細"),
  "panel.foods": m("Food list", "食品リスト"),
  "panel.online": m("Online", "オンライン"),
  "panel.label": m("Label", "ラベル"),
  "panel.recipes": m("Recipes", "レシピ"),
  "foods.typeToSearch": m("Type to search the full list.", "入力すると全リストから検索できます。"),
  /* archive */
  "plans.archive": m("Archive plan", "プランをアーカイブ"),
  "plans.archived": m("Archived ({n})", "アーカイブ済み（{n}）"),
  "plans.restore": m("Restore", "復元"),
  "toast.planArchived": m("Archived “{name}”", "「{name}」をアーカイブしました"),
  "toast.planRestored": m("Restored “{name}”", "「{name}」を復元しました"),
  "week.archivedSuffix": m("(archived)", "（アーカイブ済み）"),
  "backup.unknownDate": m("an unknown date", "日付不明"),
  "backup.confirm": m(
    "This backup was saved on {when} and contains {plans} plan(s), {products} product(s) and {recipes} recipe(s).\n\nReplace your current data with it? (You can undo right after.)",
    "このバックアップは {when} に保存されたもので、プラン {plans} 件・食品 {products} 件・レシピ {recipes} 件が含まれます。\n\n現在のデータを置き換えますか？（直後なら元に戻せます）"
  ),
  "toast.restoredFrom": m("Restored backup from {when}", "{when} のバックアップを復元しました"),
  /* fit a product into the plan */
  "fit.menu": m("Fit a product into this plan…", "商品をプランに組み込む…"),
  "fit.rowHint": m("Where could this fit in my plan?", "このプランのどこに入れられる？"),
  "fit.title": m("Fit a product into my plan", "商品をプランに組み込む"),
  "fit.intro": m(
    "Found something new? Choose it and GreenMacros shows what in your plan it could replace, and how much to use to keep the macros about the same.",
    "新しい商品を見つけたら、それを選ぶと、プランのどの食品と置き換えられるか、栄養素をほぼ同じに保つ量とともに表示します。"
  ),
  "fit.macroOnly": m(
    "Matches are based on calories and macros only — not taste, texture, allergens, ingredients or micronutrients.",
    "一致度はカロリーと三大栄養素のみで判断します。味・食感・アレルゲン・原材料・微量栄養素は考慮しません。"
  ),
  "fit.product": m("The product", "商品"),
  "fit.srcMine": m("My products", "登録済み"),
  "fit.srcManual": m("Enter manually", "手入力"),
  "fit.pickMine": m("Choose one of my products…", "登録済みの食品から選ぶ…"),
  "fit.use": m("Use this", "これを使う"),
  "fit.per": m("per {amount} {unit}", "{amount} {unit} あたり"),
  "fit.change": m("Change", "変更"),
  "fit.notSaved": m("Not in your product list yet — it's added when you swap.", "まだ食品リストにありません。置き換えると自動で追加されます。"),
  "fit.results": m("What it could replace", "置き換えられる食品"),
  "fit.lookIn": m("Look in", "対象"),
  "fit.allPlans": m("All plans", "すべてのプラン"),
  "fit.includeLocked": m("Include locked items", "固定した食品も含める"),
  "fit.none": m(
    "Nothing in this plan has a similar enough profile. Try another plan, include locked items, or add it as a new item instead.",
    "栄養バランスが近い食品が見つかりません。別のプランを選ぶか、固定した食品を含めるか、新しい食品として追加してください。"
  ),
  "fit.great": m("Great fit", "とても近い"),
  "fit.good": m("Good fit", "近い"),
  "fit.rough": m("Rough fit", "やや近い"),
  "fit.poor": m("Poor fit", "遠い"),
  "fit.swap": m("Swap", "置き換える"),
  "toast.swapped": m("Swapped {from} for {to}", "{from} を {to} に置き換えました"),

  /* optional balance suggestions */
  "balance.show": m("Suggest ways to balance (optional)", "バランス調整の提案を見る（任意）"),
  "balance.hide": m("Hide suggestions", "提案を閉じる"),
  "balance.optional": m(
    "Optional. Nothing changes unless you press Apply, and you can undo.",
    "任意の機能です。「適用」を押さない限り何も変更されず、元に戻すこともできます。"
  ),
  "balance.noTarget": m("Set at least one target above to get suggestions.", "提案を表示するには、上で目標を1つ以上設定してください。"),
  "balance.balanced": m("Already within 5% of every target — nothing to fix.", "すべての目標の±5%以内です。調整は不要です。"),
  "balance.none": m(
    "No simple edit gets you meaningfully closer. Try “Build from products” on a meal.",
    "簡単な変更では目標に近づけません。食事の「食品から食事を作る」をお試しください。"
  ),
  "balance.addTo": m("Add new items to", "追加先の食事"),
  "balance.add": m("Add {name} {amount} to {meal}", "{meal} に {name} を {amount} 追加"),
  "balance.scale": m("Change {name}: {from} → {to}", "{name} の量を変更：{from} → {to}"),
  "balance.remove": m("Remove {name} ({amount}) from {meal}", "{meal} から {name}（{amount}）を外す"),
  "balance.apply": m("Apply", "適用"),
  "toast.suggestionApplied": m("Suggestion applied", "提案を適用しました")
};
