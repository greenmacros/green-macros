import Icon from "./Icon";
import { useI18n } from "../i18n/context";

/** Sun / moon segmented switch; the current theme is highlighted. */
export default function ThemeSwitch({ theme, onChange }) {
  const { t } = useI18n();
  const options = [
    ["light", "sun", t("theme.light")],
    ["dark", "moon", t("theme.dark")]
  ];
  return (
    <div className="seg theme-switch" role="group" aria-label={t("theme.label")}>
      {options.map(([mode, icon, label]) => (
        <button
          key={mode}
          className={theme === mode ? "on" : ""}
          aria-pressed={theme === mode}
          title={label}
          aria-label={label}
          onClick={() => theme !== mode && onChange()}
        >
          <Icon name={icon} size={16} />
        </button>
      ))}
    </div>
  );
}
