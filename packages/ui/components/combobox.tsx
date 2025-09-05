import { cx } from '@ahpatuh/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Badge,
  Button,
} from '@ahpatuh/ui';
import { useState } from 'react';
import { XIcon } from 'lucide-react';

interface ComboboxProps {
  placeholder: string;
  emptyString: string;
  emptySelectionString: string;
  data: { displayName: string; value: string; active: boolean }[];
  onChange: (data: ComboboxProps['data']) => void;
  addHandler?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}
export function Combobox({
  emptySelectionString,
  placeholder,
  emptyString,
  data,
  onChange,
  addHandler,
  disabled,
  className,
}: ComboboxProps) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <div className={cx('', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          asChild
          onKeyDown={(e) => {
            e.preventDefault();
            if (e.code == 'Space' || e.code == 'Enter') {
              setOpen(true);
            }
          }}
        >
          <div
            tabIndex={0}
            className='bg-white min-h-10 rounded-md border border-black p-2 flex gap-2 flex-wrap'
          >
            {!data.filter((d) => d.active).length && (
              <span className='text-gray-500'>{emptySelectionString}</span>
            )}
            {data
              .filter((d) => d.active)
              .map((d) => (
                <Badge key={d.value} variant='default' className='h-10'>
                  {d.displayName}
                  <Button
                    className='w-auto h-auto p-2! ml-4 rounded-full bg-transparent'
                    onClick={(e) => {
                      e.preventDefault();
                      const copy = [...data];
                      const idx = copy.findIndex((c) => c.value === d.value)!;
                      copy[idx].active = false;
                      onChange(copy);
                    }}
                  >
                    <XIcon />
                  </Button>
                </Badge>
              ))}
          </div>
        </PopoverTrigger>
        <PopoverContent className='p-0' side='bottom' align='start'>
          <Command
            filter={(value, search) => {
              const found = data.find(
                (d) =>
                  d.value === value &&
                  d.displayName.toLowerCase().includes(search.toLowerCase()),
              );
              return found ? 1 : 0;
            }}
          >
            <CommandInput
              placeholder={placeholder}
              value={value}
              onValueChange={setValue}
            />
            <CommandList>
              <CommandEmpty className='px-2 py-4 space-y-4 text-center'>
                <p>{emptyString}</p>
                {addHandler &&
                  value.length > 0 &&
                  !data
                    .filter((x) => x.active)
                    .find(
                      (x) =>
                        x.displayName.toLowerCase() === value.toLowerCase(),
                    ) && (
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full'
                      onClick={() => {
                        addHandler(value);
                      }}
                    >
                      Add
                    </Button>
                  )}
              </CommandEmpty>
              <CommandGroup>
                {data
                  .filter((d) => !d.active)
                  .map((d) => (
                    <CommandItem
                      key={d.value}
                      value={d.value}
                      onSelect={(currentValue) => {
                        const copy = [...data];
                        const idx = copy.findIndex(
                          (d) => d.value === currentValue,
                        )!;
                        copy[idx].active = true;
                        onChange(copy);
                      }}
                    >
                      {d.displayName}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
