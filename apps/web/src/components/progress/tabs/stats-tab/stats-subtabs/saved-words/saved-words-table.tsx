import { useMemo } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { LanguageFilterValue } from '../learned-words/language-filter.tsx'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { PopoverForSavedWord } from './popover-for-saved-word.tsx'
import { useLingui } from '@lingui/react/macro'
import type { SavedWord } from '@yourbestaccent/api-client/orpc-contracts/saved-words-contract'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { useRemoveSavedWord, type SavedWordsInfiniteQueryData } from '@/hooks/api/saved-words/saved-words-hooks'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

export const SavedWordsTable = ({
  data,
  languageFilter,
}: {
  data: SavedWordsInfiniteQueryData
  languageFilter: LanguageFilterValue
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(ROUTE_PATHS.DASHBOARD)
  }
  const { mutate: removeSavedWord, isPending } = useRemoveSavedWord()

  const flatData = useMemo(() => {
    if (!data) {
      return []
    }

    return (
      data.pages
        .flatMap((group) => group.data?.savedWords ?? [])
        .filter((word) => languageFilter === undefined || word.language === languageFilter) ?? []
    )
  }, [data, languageFilter])

  const columnHelper = createColumnHelper<SavedWord>()

  const { t, i18n } = useLingui()
  const languageName = languageFilter === undefined ? undefined : i18n._(langNameMessages[languageFilter])

  const columns = [
    columnHelper.accessor('word', {
      header: t`Word`,
      cell: (info) => <PopoverForSavedWord word={info.getValue()} />,
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
    columnHelper.display({
      id: 'action',
      header: t`Action`,
      cell: (info) => {
        const row = info.row.original
        const handleDelete = () => {
          removeSavedWord({
            orthographicForm: row.word,
            language: row.language,
          })
        }

        return (
          <Button onClick={handleDelete} disabled={isPending} className=''>
            <Trash2 className='h-5 min-h-5 w-5 min-w-5 text-gray-500' />
          </Button>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='flex bg-gray-50'>
              {headerGroup.headers.map((header) => {
                const isActionColumn = header.column.id === 'action'
                return (
                  <TableHead
                    key={header.id}
                    className={
                      isActionColumn
                        ? 'w-20 px-4 py-3 text-center text-sm font-semibold text-gray-900'
                        : 'flex-1 px-4 py-3 text-left text-sm font-semibold text-gray-900'
                    }
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className='flex hover:bg-gray-50'>
                {row.getVisibleCells().map((cell) => {
                  const isActionColumn = cell.column.id === 'action'
                  return (
                    <TableCell
                      key={cell.id}
                      className={
                        isActionColumn ? 'w-20 px-4 py-3' : 'flex flex-1 items-center px-4 py-3 text-sm text-gray-900'
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow className='flex h-64'>
              <TableCell
                colSpan={columns.length}
                className='flex flex-1 flex-col items-center justify-center p-8 text-center'
              >
                <h2 className='mb-2 text-2xl font-semibold text-gray-800'>
                  {languageFilter === undefined ? t`No saved words yet` : t`No saved words in ${languageName} yet`}
                </h2>
                <p className='mb-6 text-gray-600'>{t`Start saving words during exercises to build your vocabulary`}</p>
                <Button onClick={handleClick} className='bg-indigo-500 px-6 text-white hover:bg-indigo-600'>
                  {t`Take me to the exercises`}
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
