import { useConvex, useQuery } from 'convex/react';
import { api } from '@ahpatuh/convex/_generated/api';
import { isSameDay, isSameMinute, addMinutes } from 'date-fns';
import { useEffect, useState } from 'preact/hooks';
import type { FunctionReturnType } from 'convex/server';
import { WeeklyCalendar } from './components/weekly-calendar';
import { TimeSlots } from './components/time-slots';
import { EmployeeList } from './components/employee-list';
import { ServiceList } from './components/service-list';
import { CustomerForm } from './components/customer-form';
import type { Id } from '@ahpatuh/convex/_generated/dataModel';

export function App() {
  const convex = useConvex();
  const [date, _setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<
    FunctionReturnType<typeof api.widget.getEmployees>[number] | null
  >(null);
  const [services, setServices] = useState<
    FunctionReturnType<typeof api.widget.getServices>
  >([]);
  const [selectedService, setSelectedService] = useState<
    (typeof services)[number] | null
  >(null);
  const [basket, setBasket] = useState<
    {
      employee: FunctionReturnType<typeof api.widget.getEmployees>[number];
      service: (typeof services)[number];
      startDate: Date;
      endDate: Date;
    }[]
  >([]);
  const [customerForm, setCustomerForm] = useState(false);
  const [customerId, setCustomerId] = useState<Id<'customers'> | null>(null);

  const lang = 'en-Us';

  const business = useQuery(api.widget.getBusiness, {
    origin: window.location.origin,
  });

  useEffect(() => {
    if (business && selectedEmployee) {
      convex
        .query(api.widget.getServices, {
          businessId: business._id,
          positionId: selectedEmployee.position?._id,
        })
        .then((services) => {
          setServices(services);
        });
    }
  }, [business, selectedEmployee]);

  const employees =
    useQuery(
      api.widget.getEmployees,
      business
        ? {
            origin: window.location.origin,
            businessId: business._id,
          }
        : 'skip',
    ) ?? [];

  const _bookings =
    useQuery(
      api.widget.getBookings,
      business
        ? {
            origin: window.location.origin,
            businessId: business._id,
          }
        : 'skip',
    ) ?? [];

  return business ? (
    <>
      <WeeklyCalendar
        lang={lang}
        business={business}
        date={date}
        selectedDate={selectedDate}
        onDateChange={(day) => {
          setSelectedDate((date) =>
            date && isSameDay(date, day) ? null : day,
          );
          setSelectedTime(null);
          setSelectedEmployee(null);
          setServices([]);
          setSelectedService(null);
        }}
      />
      <div className='space-y-4'>
        {selectedDate && (
          <TimeSlots
            lang={lang}
            business={business}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onTimeChange={(time) => {
              setSelectedTime((selectedHour) =>
                selectedHour && isSameMinute(selectedHour, time) ? null : time,
              );
              setSelectedEmployee(null);
              setServices([]);
              setSelectedService(null);
            }}
          />
        )}
        {selectedDate && selectedTime && (
          <EmployeeList
            employees={employees}
            selectedEmployee={selectedEmployee}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onEmployeeChange={(employee) => {
              setSelectedEmployee((selectedEmployee) =>
                selectedEmployee && selectedEmployee._id == employee._id
                  ? null
                  : employee,
              );
              setServices([]);
              setSelectedService(null);
            }}
          />
        )}
        {selectedEmployee && (
          <ServiceList
            services={services}
            selectedService={selectedService}
            onServiceChange={(service) => {
              setSelectedService((selectedService) =>
                selectedService && selectedService._id === service._id
                  ? null
                  : service,
              );
            }}
            basket={basket}
          />
        )}
        {selectedService && (
          <button
            className='block border-2 border-black w-72 h-10'
            onClick={(e) => {
              e.preventDefault();
              // add to basket
              setBasket((basket) => {
                const newBasket = [...basket];
                const hasService = newBasket.find(
                  (basket) =>
                    basket.employee._id === selectedEmployee!._id &&
                    basket.service._id === selectedService._id,
                );

                if (hasService) {
                  return newBasket.filter(
                    (b) =>
                      b.employee._id !== selectedEmployee!._id &&
                      b.service._id !== selectedService._id &&
                      isSameMinute(b.startDate, selectedTime!),
                  );
                }

                return [
                  ...newBasket,
                  {
                    employee: selectedEmployee,
                    service: selectedService,
                    startDate: selectedTime,
                    endDate: selectedService?.durationInMinutes
                      ? addMinutes(
                          selectedTime!,
                          selectedService.durationInMinutes,
                        )
                      : addMinutes(selectedTime!, 60),
                  },
                ];
              });
              setSelectedService(null);
            }}
          >
            Add to Basket
          </button>
        )}
        <ul>
          {basket.map((b) => (
            <li key={b.employee._id + b.service._id}>
              {b.employee.firstName} + {b.service.name}
            </li>
          ))}
        </ul>
        {basket.length > 0 && (
          <button
            className='bg-black h-10 w-72 text-center text-white'
            onClick={(e) => {
              e.preventDefault();
              setCustomerForm(true);
            }}
          >
            Done
          </button>
        )}
        {customerForm && (
          <CustomerForm
            business={business}
            onSuccess={(customerId) => {
              if (customerId) {
                setCustomerId(customerId);
              }
              setCustomerForm(false);
            }}
          />
        )}
        {customerId && (
          <button
            className='h-10 w-72 bg-red-500 text-white'
            onClick={async (e) => {
              e.preventDefault();
              const startDate = selectedTime!;
              const minutes = basket
                .map((item) => item.service.durationInMinutes ?? 60)
                .reduce((acc, curr) => acc + curr, 0);
              const endDate = addMinutes(startDate, minutes);

              const bookingServices = await convex
                .mutation(api.widget.createBooking, {
                  customerId,
                  businessId: business._id,
                  startDate: startDate.toISOString(),
                  endDate: endDate.toISOString(),
                })
                .then((bookingId) =>
                  Promise.all(
                    basket.map((item) =>
                      convex.mutation(api.widget.createBookingService, {
                        bookingId,
                        businessId: business._id,
                        customerId,
                        serviceId: item.service._id,
                        employeeId: item.employee._id,
                      }),
                    ),
                  ),
                );
              if (bookingServices.length) {
                setCustomerId(null);
              }
            }}
          >
            Book
          </button>
        )}
      </div>
    </>
  ) : null;
}
