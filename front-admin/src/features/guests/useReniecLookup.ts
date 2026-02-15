import { useEffect, useRef } from 'react';
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastDniRef = useRef('');

  useEffect(() => {
    const subscription = watch((formValues, { name }) => {
      if (name !== 'document_number' && name !== 'document_type') return;

      clearTimeout(debounceRef.current);

      const docType = formValues.document_type;
      const docNumber = formValues.document_number ?? '';

      if (docType !== 'dni' || docNumber.length !== 8 || !/^\d{8}$/.test(docNumber)) {
        return;
      }

      if (docNumber === lastDniRef.current) return;

      debounceRef.current = setTimeout(async () => {
        try {
          const result = await trigger(docNumber, true).unwrap();
          if (result?.data) {
            setValue('first_name', result.data.preNombres);
            setValue('last_name', `${result.data.apePaterno} ${result.data.apeMaterno}`);
            lastDniRef.current = docNumber;
            enqueueSnackbar('Datos RENIEC cargados', { variant: 'success' });
          }
        } catch {
          enqueueSnackbar('No se encontraron datos para este DNI', { variant: 'warning' });
        }
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(debounceRef.current);
    };
  }, [watch, trigger, setValue, enqueueSnackbar]);

  return { isLooking: isFetching };
}
