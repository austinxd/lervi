import { useCallback, useEffect, useRef } from 'react';
import type { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useLazyReniecLookupQuery } from '../../services/guestService';
import type { Guest } from '../../interfaces/types';

interface UseReniecLookupOptions {
  watch: UseFormWatch<Partial<Guest>>;
  setValue: UseFormSetValue<Partial<Guest>>;
}

export function useReniecLookup({ watch, setValue }: UseReniecLookupOptions) {
  const { enqueueSnackbar } = useSnackbar();
  const [trigger, { isFetching }] = useLazyReniecLookupQuery();

  // Store callbacks in refs to keep useEffect deps stable
  const triggerRef = useRef(trigger);
  triggerRef.current = trigger;
  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;
  const snackbarRef = useRef(enqueueSnackbar);
  snackbarRef.current = enqueueSnackbar;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastDniRef = useRef<string>('');

  const docType = watch('document_type');
  const docNumber = watch('document_number');

  const doLookup = useCallback(async (dni: string) => {
    try {
      const result = await triggerRef.current(dni).unwrap();
      if (result?.data) {
        setValueRef.current('first_name', result.data.preNombres);
        setValueRef.current('last_name', `${result.data.apePaterno} ${result.data.apeMaterno}`);
        lastDniRef.current = dni;
        snackbarRef.current('Datos RENIEC cargados', { variant: 'success' });
      }
    } catch {
      snackbarRef.current('No se encontraron datos para este DNI', { variant: 'warning' });
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (docType !== 'dni' || !docNumber || docNumber.length !== 8 || !/^\d{8}$/.test(docNumber)) {
      return;
    }

    if (docNumber === lastDniRef.current) return;

    debounceRef.current = setTimeout(() => doLookup(docNumber), 500);

    return () => clearTimeout(debounceRef.current);
  }, [docType, docNumber, doLookup]);

  return { isLooking: isFetching };
}
