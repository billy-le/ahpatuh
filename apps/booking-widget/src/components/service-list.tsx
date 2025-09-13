import type { api } from '@ahpatuh/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { cx } from '@ahpatuh/utils';

interface ServiceListProps {
  services: FunctionReturnType<typeof api.widget.getServices>;
  selectedService:
    | FunctionReturnType<typeof api.widget.getServices>[number]
    | null;
  onServiceChange: (
    service: FunctionReturnType<typeof api.widget.getServices>[number],
  ) => void;
  basket: {
    employee: FunctionReturnType<typeof api.widget.getEmployees>[number];
    service: FunctionReturnType<typeof api.widget.getServices>[number];
    startDate: Date;
    endDate: Date;
  }[];
}
export function ServiceList({
  services,
  selectedService,
  onServiceChange,
  basket,
}: ServiceListProps) {
  return (
    <ul className='space-y-4'>
      {services
        .filter((service) => !basket.find((b) => b.service._id === service._id))
        .map((service) => (
          <li key={service._id}>
            <button
              className={cx('text-center border-2 border-pink-300 w-72 h-10', {
                'bg-pink-500 border-pink-500 text-white':
                  service._id === selectedService?._id,
              })}
              onClick={(e) => {
                e.preventDefault();
                onServiceChange(service);
              }}
            >
              {service.name} {service.price}
            </button>
          </li>
        ))}
    </ul>
  );
}
