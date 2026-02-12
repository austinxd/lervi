import { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TextField, Paper, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface Column<T> {
  id: string;
  label: string;
  render: (row: T) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  onSearch?: (search: string) => void;
  searchPlaceholder?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
}

export default function DataTable<T>({
  columns, rows, total, page, onPageChange,
  onSearch, searchPlaceholder = 'Buscar...', rowKey,
  onRowClick, toolbar,
}: Props<T>) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (val: string) => {
    setSearchValue(val);
    onSearch?.(val);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {(onSearch || toolbar) && (
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {onSearch && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
          )}
          {toolbar && <Box sx={{ display: 'flex', gap: 1, ml: 'auto', flexWrap: 'wrap' }}>{toolbar}</Box>}
        </Box>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align} sx={{ width: col.width }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                hover
                onClick={() => onRowClick?.(row)}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align}>{col.render(row)}</TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        rowsPerPage={10}
        rowsPerPageOptions={[10]}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
    </Paper>
  );
}
