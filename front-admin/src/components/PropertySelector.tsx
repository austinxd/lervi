import { FormControl, MenuItem, Select } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveProperty } from '../features/auth/authSlice';
import { useGetPropertiesQuery } from '../services/organizationService';

export default function PropertySelector() {
  const dispatch = useAppDispatch();
  const activePropertyId = useAppSelector((s) => s.auth.activePropertyId);
  const { data } = useGetPropertiesQuery({});

  const properties = data?.results ?? [];
  if (properties.length <= 1) return null;

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <Select
        value={activePropertyId ?? ''}
        onChange={(e) => dispatch(setActiveProperty(e.target.value))}
        displayEmpty
        sx={{ bgcolor: 'white', borderRadius: 1 }}
      >
        {properties.map((p) => (
          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
