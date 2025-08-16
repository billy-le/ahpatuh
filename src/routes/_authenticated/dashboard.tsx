import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState, } from 'react'
import { Calendar } from '~/components/Calendar'
import { LangSelector } from '~/components/LangSelector';
import { barbers } from '~/data/barbers';
import { startOfDay, addDays, endOfYesterday } from 'date-fns';
import { cx } from '~/utils/cva.config';
import { authClient } from '~/utils/auth-client';

export const Route = createFileRoute('/_authenticated/dashboard')({
  beforeLoad: async (ctx) => {
    if (!ctx.context.userSession) {
      throw redirect({ to: '/' })
    }
  },
  component: Home,
})

const langs = [
  { value: 'en-US', displayValue: 'English' },
  { value: 'ar-EG', displayValue: "Arabic" },
  { value: 'zh-Hant', displayValue: "Chinese" },
  { value: 'ru-BY', displayValue: "Russian" }
]

function Home() {
  const router = useRouter()
  const [lang, setLang] = useState('en-US');
  const [selectedBarber, setSelectedBarber] = useState<typeof barbers[number] | null>(null)
  const blockPastFrom = endOfYesterday();
  const blockFutureFrom = startOfDay(addDays(new Date(), 15))

  return (
    <div className='flex flex-col items-center justify-center min-h-dvh'>
      <header className="container mx-auto px-4 py-2 flex justify-between items-center mb-10">
        <LangSelector
          langs={langs}
          onLangChange={setLang} />
        <button onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.navigate({ to: '/' })
              }
            }
          })
        }}>
          Sign Out
        </button>
      </header>
      <div className="rounded-md container mx-auto w-fit flex max-h-[800px] bg-white divide-x divide-gray-400/50 border border-gray-400/50 drop-shadow-lg overflow-hidden">
        <ul className='w-72 flex flex-col gap-3 py-3 px-6 shrink-0 flex-1 overflow-y-auto'>
          {barbers.map(barber => <li key={barber.id.value}>
            <button onClick={() => {
              setSelectedBarber(barber)
            }} className={cx('flex gap-2 w-full px-3 py-2 rounded-md bg-white border border-gray-400/50 drop-shadow-sm', selectedBarber?.id?.value === barber.id.value ? 'drop-shadow-none border-blue-600 ring-2 ring-blue-600' : '')}>
              <img src={barber.picture.large} alt={`${barber.name.first} ${barber.name.last} headshot`} className='size-12 rounded-full object-cover border border-gray-300/50 drop-shadow' />
              <div className='text-left'>
                <h3 className="font-bold text-gray-600">{barber.name.first} {barber.name.last}</h3>
                <p className='text-xs text-gray-400'>Licensed Barber</p>
              </div>
            </button>
          </li>)}
        </ul>
        <Calendar lang={lang} blockPastDatesFrom={blockPastFrom} blockFutureDatesFrom={blockFutureFrom} />
      </div >
    </div >
  )
}
