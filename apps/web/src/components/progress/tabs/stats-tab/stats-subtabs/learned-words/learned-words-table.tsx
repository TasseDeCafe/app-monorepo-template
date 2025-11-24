import { useMemo } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../shadcn/table.tsx'
import { LanguageFilterValue } from './language-filter.tsx'
import { CorrectUserPronunciation } from '@yourbestaccent/api-client/orpc-contracts/words-contract'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

const columnHelper = createColumnHelper<CorrectUserPronunciation>()

export const LearnedWordsTable = ({
  data,
  languageFilter,
}: {
  data: CorrectUserPronunciation[]
  languageFilter: LanguageFilterValue
}) => {
  const { t, i18n } = useLingui()

  const anyLanguageLabel = t`any language`
  const languageText = languageFilter === undefined ? anyLanguageLabel : i18n._(langNameMessages[languageFilter])

  const columns = useMemo(
    () => [
      columnHelper.accessor('word', {
        header: t`Word`,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('language', {
        header: t`Language`,
        cell: (info) => (
          <div className='flex items-center justify-center space-x-2'>
            <CustomCircularFlag languageOrDialectCode={info.getValue()} className='h-5 w-5' />
            <span className='text-sm text-gray-700'>{i18n._(langNameMessages[info.getValue()])}</span>
          </div>
        ),
      }),
      columnHelper.accessor('dateOfFirstTimePronouncedCorrectly', {
        header: t`Learned On`,
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    [t, i18n]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='flex bg-gray-50'>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className='flex-1 px-4 py-3 text-left text-sm font-semibold text-gray-900'>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className='flex hover:bg-gray-50'>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='flex flex-1 items-center px-4 py-3'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className='flex'>
              <TableCell colSpan={columns.length} className='flex-1 px-4 py-8 text-center text-gray-500'>
                {t`No words learned for ${languageText} yet.`}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
