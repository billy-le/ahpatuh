interface LangSelectorProps {
  langs: { value: string; displayValue: string }[];
  onLangChange: (lang: string) => void;
}

export const LangSelector = ({ langs, onLangChange }: LangSelectorProps) => {
  return (
    <select
      defaultValue='en-US'
      defaultChecked
      onChange={(e) => {
        onLangChange(e.target.value);
      }}
    >
      {langs.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.displayValue}
        </option>
      ))}
    </select>
  );
};
