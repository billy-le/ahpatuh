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

const formSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email().optional(),
  phone: z.string().optional(),
  hiredDate: z.string().optional(),
  isActive: z.boolean().default(true),
  positionId: z.string(),
})

export function EmployeeForm() {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    }
  })


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
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
                    <span>Select a Position</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search position" />
                    <CommandList>
                      <CommandEmpty><div className="space-y-4 px-4">
                        <p>No Positions found.</p>
                        <div className="flex">
                          <Input type="text" className="rounded-r-none" placeholder="Add a position" />
                          <Button type="button" className="rounded-l-none">
                            <Plus />
                          </Button>
                        </div>
                      </div></CommandEmpty>
                      <CommandGroup>
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
    </form>
  </Form>
}
