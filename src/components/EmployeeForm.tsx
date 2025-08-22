import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Button } from "./ui/button";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { format as dateFormatter, parse as dateParser, isValid } from 'date-fns'

interface EmployeeFormProps {
  onSuccess: (open: boolean) => void;
}

const formSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email().optional(),
  phone: z.e164().optional(),
  hiredDate: z.string().optional().transform(str => {
    try {
      const date = str ? new Date(str) : ''
      if (isValid(date)) {
        return dateFormatter(date, 'MM/dd/yyyy')
      }
      return str
    } catch (err) {
      return str
    }
  }),
  isActive: z.boolean().default(true),
  positionId: z.string(),
})

export function EmployeeForm({ onSuccess }: EmployeeFormProps) {
  const [open, setOpen] = useState(false);
  const createRole = useMutation(api.roles.createRole)
  const positions = useQuery(api.roles.getRoles) ?? [];
  const createEmployee = useMutation(api.employees.createEmployee);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    }
  })


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createEmployee({
      ...values,
      positionId: values.positionId as Id<'roles'>
    }).then(() => {
      onSuccess(false);
    })
  }

  return <Form {...form}>
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="hiredDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hired Date</FormLabel>
            <FormControl>
              <Input {...field} type="date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="positionId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={true}
                    className="justify-between"
                  >
                    {field.value ? <span>{positions.find(p => p._id === field.value)?.name}</span> : <span>Select a Position</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" side="right" sideOffset={4} align="start">
                  <Command>
                    <CommandInput placeholder="Search position" />
                    <CommandList>
                      <CommandEmpty><div className="space-y-4 px-4">
                        <p>No Positions found.</p>
                        <div className="flex">
                          <Input type="text" className="rounded-r-none" placeholder="Add a position" />
                          <Button type="button" className="rounded-l-none" onClick={async (e) => {
                            const target = e.target as HTMLButtonElement;
                            const input = target.previousSibling as HTMLInputElement;
                            const roleId = await createRole({ name: input.value })
                            if (roleId) {
                              field.onChange(roleId)
                              setOpen(false)
                            }
                          }}>
                            <Plus />
                          </Button>
                        </div>
                      </div></CommandEmpty>
                      <CommandGroup>
                        {positions.map(position =>
                          <CommandItem key={position._id} value={position._id}
                            onSelect={(currentValue) => {
                              field.onChange(field.value === currentValue ? '' : currentValue)
                              setOpen(false)
                            }}
                          >
                            {position.name}
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Add</Button>
    </form>
  </Form>
}
