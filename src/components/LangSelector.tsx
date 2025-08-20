import { Id } from "convex/_generated/dataModel";

interface LangSelectorProps {
  langs: { _id: Id<'languages'>, value: string; name: string }[];
  onLangChange: (lang: { _id: Id<'languages'>, value: string, name: string }) => void;
}

export const LangSelector = ({ langs, onLangChange }: LangSelectorProps) => {
  return (
    <select
      defaultValue='en-US'
      defaultChecked
      onChange={(e) => {
        onLangChange(langs.find(lang => e.target.value === lang.value)!);
      }}
    >
      {langs.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};
