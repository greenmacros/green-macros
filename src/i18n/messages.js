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

  /* tour */
  "tour.title": m("Guided tour", "ガイドツアー"),
  "tour.button": m("How to use", "使い方"),
  "tour.step": m("Step {n} of {total}", "{n} / {total}"),
  "tour.next": m("Next", "次へ"),
  "tour.back": m("Back", "戻る"),
  "tour.skip": m("Skip", "スキップ"),
  "tour.done": m("Done", "完了"),
  "tour.welcome.title": m("Quick tour", "クイックツアー"),
  "tour.welcome.body": m(
    "A 1-minute look at how GreenMacros works. Use the arrow keys or the buttons; Esc closes it. You can reopen it anytime with the ? button.",
    "1分でわかる GreenMacros の使い方です。矢印キーまたはボタンで進み、Esc で閉じます。右上の ? ボタンでいつでも再開できます。"
  ),
  "tour.tabs.title": m("Three tabs", "3つのタブ"),
  "tour.tabs.body": m(
    "Plan is for building a day of meals, Week assigns plans to days, and Products is your food list.",
    "「プラン」は1日の食事を作る場所、「週間」はプランを曜日に割り当て、「食品」は食品リストです。"
  ),
  "tour.plans.title": m("Plans", "プラン"),
  "tour.plans.body": m(
    "Each plan is one day of eating, e.g. Workout day or Rest day. Use + to add another and the tab’s edit options to rename, recolor or delete it.",
    "1つのプランが1日分の食事です（例：トレーニング日、休息日）。＋で追加し、タブの編集で名前・色の変更や削除ができます。"
  ),
  "tour.meal.title": m("Meals", "食事"),
  "tour.meal.body": m(
    "Each card is a meal. Rename it, set optional macro targets, and reorder or duplicate it from its menu.",
    "1枚のカードが1食です。名前の変更、栄養目標の設定、並べ替えや複製ができます。"
  ),
  "tour.additem.title": m("Add foods", "食品を追加"),
  "tour.additem.body": m(
    "Search your products here to add them to the meal, then type an amount.",
    "ここで食品を検索して食事に追加し、量を入力します。"
  ),
  "tour.summary.title": m("Daily totals", "1日の合計"),
  "tour.summary.body": m(
    "Set your daily calorie and macro targets. Actual and Remaining update as you add food.",
    "1日のカロリーと栄養目標を設定します。食品を追加すると実績と残りが更新され。"
  ),
  "tour.week.title": m("Weekly view", "週間ビュー"),
  "tour.week.body": m(
    "Assign one of your plans to each day, leave a day as rest, and print the whole week.",
    "各曜日にプランを割り当て、休息日はそのままにして、1週間分を印刷できます。"
  ),
  "tour.filters.title": m("Find products", "食品を探す"),
  "tour.filters.body": m(
    "Search, sort and filter your list by category, and switch between list views.",
    "食品リストを検索・並べ替え・カテゴリで絞り込み、表示を切り替えられます。"
  ),
  "tour.manual.title": m("Add by hand", "手入力で追加"),
  "tour.manual.body": m(
    "Type in a product’s name and macros yourself, or use the … menu for starter foods and duplicate cleanup.",
    "食品名と栄養素を手入力できます。… メニューにはスターター食品や重複の整理もあります。"
  ),
  "tour.addpanel.title": m("More ways to add", "いろいろな追加方法"),
  "tour.addpanel.body": m(
    "Search the built-in Food list, look up Online, paste a nutrition Label (English or Japanese) or build Recipes.",
    "内蔵の食品リストから検索、オンライン検索、栄養成分表示（英語・日本語）の貼り付け、レシピ作成ができます。"
  ),
  "tour.share.title": m("Share", "共有"),
  "tour.share.body": m(
    "Copy a link to the current plan, or to all plans, to send to someone.",
    "現在のプラン、またはすべてのプランへのリンクをコピーして共有できます。"
  ),
  "tour.settings.title": m("Backups", "バックアップ"),
  "tour.settings.body": m(
    "Your data is stored only in this browser. Export a backup here regularly, and restore or import files too.",
    "データはこのブラウザにのみ保存されます。ここから定期的にバックアップを書き出し、復元や読み込みもできます。"
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
  "theme.light": m("Light mode", "ライトモード"),
  "theme.dark": m("Dark mode", "ダークモード"),
  "theme.label": m("Theme", "テーマ"),
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

  /* organize mode */
  "organize.start": m("Organize", "並べ替え"),
  "organize.done": m("Done", "完了"),
  "organize.hint": m("Reorder by dragging", "ドラッグで並べ替え"),
  "organize.help": m(
    "Drag the grip (or use the arrows) to reorder meals and items. Drop an item on another meal to move it there. Changes save automatically.",
    "つまみをドラッグ（または矢印を使用）して、食事や食品を並べ替えます。食品を別の食事にドロップすると移動できます。変更は自動で保存されます。"
  ),
  "organize.productsHelp": m(
    "Drag rows (or use the arrows) to set your own order. The list stays in this order under “Manual order”.",
    "行をドラッグ（または矢印を使用）して好きな順に並べます。この順序は並べ替えの「手動」で保たれます。"
  ),
  "organize.drag": m("Drag to reorder", "ドラッグして並べ替え"),
  "organize.moveTo": m("Move to…", "移動先…"),
  "organize.dropHere": m("Drop items here", "ここに食品をドロップ"),
  "organize.items": m("{n} item(s)", "{n} 件"),
  "sort.manual": m("Manual order", "手動"),
  /* categories & product list */
  "cat.label": m("Category", "カテゴリ"),
  "cat.all": m("All", "すべて"),
  "cat.protein": m("Protein", "たんぱく源"),
  "cat.grains": m("Grains & starch", "穀類・いも"),
  "cat.veg": m("Vegetables", "野菜・きのこ・海藻"),
  "cat.fruit": m("Fruit", "果物"),
  "cat.fats": m("Nuts, seeds & fats", "ナッツ・種・油脂"),
  "cat.drinks": m("Drinks", "飲み物"),
  "cat.other": m("Other", "その他"),
  "form.category": m("Category", "カテゴリ"),
  "products.status.label": m("Show", "表示"),
  "products.status.fav": m("Favorites", "お気に入り"),
  "products.status.used": m("In use", "使用中"),
  "products.status.unused": m("Unused", "未使用"),
  "products.clearFilters": m("Clear filters", "絞り込みを解除"),
  "products.view.label": m("View", "表示形式"),
  "products.view.list": m("List", "リスト"),
  "products.view.grouped": m("By category", "カテゴリ別"),
  "products.showMore": m("Show {n} more ({left} left)", "さらに {n} 件表示（残り {left} 件）"),
  "sort.used": m("Most used", "よく使う順"),
  "products.select": m("Select", "選択"),
  "products.selectDone": m("Done", "完了"),
  "products.selected": m("{n} selected", "{n} 件選択中"),
  "products.selectAll": m("Select all {n}", "{n} 件すべて選択"),
  "products.clearSel": m("Clear", "選択解除"),
  "products.bulkFav": m("Favorite", "お気に入りにする"),
  "products.bulkUnfav": m("Unfavorite", "お気に入り解除"),
  "products.setCategory": m("Set category…", "カテゴリを設定…"),
  "products.confirmBulk": m(
    "Delete {n} product(s)? {used} of them are used in plans, which will then show “Missing product”.",
    "{n} 件の食品を削除しますか？そのうち {used} 件はプランで使用中で、削除後は「食品が見つかりません」と表示されます。"
  ),
  "toast.bulkDeleted": m("Deleted {n} products", "{n} 件の食品を削除しました"),
  "toast.noUnused": m("Every product is used in a plan or recipe", "すべての食品がプランまたはレシピで使われています"),
  "products.findDuplicates": m("Find duplicates…", "重複を探す…"),
  "products.selectUnused": m("Select unused products", "未使用の食品を選択"),

  /* duplicates */
  "dup.title": m("Find duplicates", "重複を探す"),
  "dup.intro": m(
    "These products look like the same thing. Choose the one to keep — plans and recipes that use the others switch to it.",
    "同じものと思われる食品です。残す食品を選ぶと、他の食品を使っているプランやレシピは残した食品に切り替わります。"
  ),
  "dup.none": m("No duplicates found.", "重複は見つかりませんでした。"),
  "dup.byName": m("Same name", "同じ名前"),
  "dup.byNutrition": m("Different names, identical nutrition", "名前は違うが栄養値が同じ"),
  "dup.keep": m("Keep", "残す"),
  "dup.ignore": m("Not duplicates", "重複ではない"),
  "dup.merge": m("Merge ({n} removed)", "統合する（{n} 件を削除）"),
  "dup.warn": m(
    "Amounts stay the same when items switch products, so check your totals afterwards. You can undo right after merging.",
    "食品が切り替わっても量はそのままなので、統合後に合計をご確認ください。統合直後なら元に戻せます。"
  ),
  "toast.merged": m("Merged {n} duplicate(s) into “{name}”", "{n} 件の重複を「{name}」に統合しました")
};
