import { ColumnDef } from "@tanstack/react-table"
import type { FunctionReturnType } from "convex/server"
import { api } from "convex/_generated/api"
import { User2, EllipsisVerticalIcon } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

export const employeeColumns: ColumnDef<FunctionReturnType<typeof api.employees.getEmployees>[number]>[] = [
  {
    header: "First Name",
    cell: ({ row: { original } }) => <div className="flex items-center gap-4">
      {original.image ?
        <img src={original.image} />
        : <div className="size-16 rounded-full bg-yellow-200 grid place-items-center">
          <User2 size={32} />
        </div>}
      <div>
        <p>{original.firstName} {original.lastName}</p>
        <p className="text-gray-500">{original.email}</p>
      </div>
    </div>
  },
  {
    header: 'Hired Date',
    accessorFn: (props) => props.hiredDate ? props.hiredDate : "N/A"
  },
  {
    accessorFn: row => row.position.name,
    header: 'Position'
  },
  {
    header: "Action",
    cell: () => <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align="start">
        <DropdownMenuItem>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  }
]
