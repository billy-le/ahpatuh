import { Id } from 'convex/_generated/dataModel';

type Lang = { _id: Id<'languages'>; value: string; name: string };

interface LangSelectorProps {
  langs: Lang[];
  onLangChange: (lang: Lang) => void;
  defaultLang?: Lang;
}

export const LangSelector = ({
  langs,
  onLangChange,
  defaultLang,
}: LangSelectorProps) => {
  return (
    <select
      defaultValue={defaultLang ? defaultLang.value : 'en-US'}
      onChange={(e) => {
        onLangChange(langs.find((lang) => e.target.value === lang.value)!);
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
