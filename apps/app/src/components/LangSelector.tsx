import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@ahpatuh/ui/components/select';
import type { Id } from '@ahpatuh/convex/_generated/dataModel';
type Lang = { _id: Id<'languages'>; value: string; name: string };

interface LangSelectorProps {
  langs: Lang[];
  onLangChange: (lang: Lang) => void;
  defaultLang?: Lang | null;
  disabled?: boolean;
}

export const LangSelector = ({
  langs,
  onLangChange,
  defaultLang,
  disabled,
}: LangSelectorProps) => {
  return (
    <Select
      onValueChange={(value) => {
        onLangChange(langs.find((lang) => lang.value === value)!);
      }}
      defaultValue={defaultLang?.value ?? 'en-US'}
      disabled={disabled}
    >
      <SelectTrigger className='border border-black'>
        <SelectValue placeholder='Select a language' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Languages</SelectLabel>
          {langs.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
