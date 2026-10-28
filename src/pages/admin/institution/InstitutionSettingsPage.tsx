import { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, CheckCircle2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInstitution, useSaveInstitution } from '@/features/institution/hooks/useInstitution';
import type { InstitutionPayload } from '@/features/institution/types/institution.types';

const initial: InstitutionPayload = {
  name: '', abbreviation: '', modular_code: null, local_code: null,
  ugel: null, dre: null, address: null, phone: null, contact_email: null,
};

const fields: Array<{ key: keyof InstitutionPayload; label: string; placeholder?: string }> = [
  { key: 'modular_code', label: 'Código modular' },
  { key: 'local_code', label: 'Código de local escolar' },
  { key: 'ugel', label: 'UGEL' },
  { key: 'dre', label: 'DRE / GRE' },
  { key: 'address', label: 'Dirección' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'contact_email', label: 'Correo de contacto institucional', placeholder: 'contacto@institucion.edu.pe' },
];

function normalizeAbbreviation(input: string): string {
  return input.toLowerCase().trim();
}

export function InstitutionSettingsPage() {
  const institution = useInstitution();
  const saveInstitution = useSaveInstitution();
  const [form, setForm] = useState<InstitutionPayload>(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [exampleCode, setExampleCode] = useState('E2600001');

  useEffect(() => {
    if (institution.data) {
      const { name, abbreviation, modular_code, local_code, ugel, dre, address, phone, contact_email } = institution.data;
      setForm({ name, abbreviation, modular_code, local_code, ugel, dre, address, phone, contact_email });
    }
  }, [institution.data]);

  const setField = (key: keyof InstitutionPayload, value: string) => {
    setForm(prev => ({ ...prev, [key]: key === 'abbreviation' ? normalizeAbbreviation(value) : value }));
    setFieldErrors(prev => ({ ...prev, [key]: '' }));
  };

  const abbreviationValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.abbreviation) && form.abbreviation.length >= 2 && form.abbreviation.length <= 20;
  const preview = `${exampleCode.toLowerCase()}@${abbreviationValid ? form.abbreviation : 'abreviatura'}.com`;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    if (!form.name.trim() || !abbreviationValid) {
      toast.error('Completa el nombre e ingresa una abreviatura válida.');
      return;
    }
    try {
      await saveInstitution.mutateAsync({
        ...form,
        name: form.name.trim(),
        ...Object.fromEntries(fields.map(({ key }) => [key, form[key]?.trim() || null])),
      });
      toast.success('Datos institucionales guardados correctamente.');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
        if (errors) setFieldErrors(Object.fromEntries(Object.entries(errors).map(([k, values]) => [k, values[0] ?? 'Dato inválido'])));
        if (error.response?.status === 403) {
          toast.error('No tienes permiso para modificar la configuración institucional.');
          return;
        }
        toast.error(error.response?.data?.message ?? 'No se pudieron guardar los datos.');
      } else {
        toast.error('Ocurrió un error inesperado.');
      }
    }
  };

  if (institution.isLoading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Cargando configuración...</div>;
  if (institution.isError) return <div className="space-y-3"><p className="text-sm text-destructive">No se pudo cargar la configuración.</p><Button variant="outline" onClick={() => institution.refetch()}>Reintentar</Button></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-muted p-2"><Building2 className="h-6 w-6"/></div>
        <div><h1 className="text-2xl font-bold">Datos generales de la institución</h1><p className="text-sm text-muted-foreground">Configuración para esta instalación del sistema escolar.</p></div>
      </div>
      {!institution.data && <p className="rounded-lg border p-3 text-sm text-muted-foreground">Configuración inicial: registra los datos de la institución antes de generar cuentas institucionales.</p>}
      <form onSubmit={submit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Identidad institucional</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2"><Label htmlFor="name">Nombre oficial *</Label><Input id="name" maxLength={200} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="I.E. Emblemática Aurelio Cárdenas Pachas"/><p className="text-xs text-destructive">{fieldErrors.name}</p></div>
            <div className="space-y-2"><Label htmlFor="abbreviation">Abreviatura institucional *</Label><Input id="abbreviation" maxLength={20} value={form.abbreviation} onChange={e => setField('abbreviation', e.target.value)} placeholder="acp"/><p className="text-xs text-muted-foreground">Se guarda en minúsculas. Solo letras sin tildes, números y guiones simples.</p>{fieldErrors.abbreviation && <p className="text-xs text-destructive">{fieldErrors.abbreviation}</p>}</div>
            <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
              <p className="text-sm font-medium">Vista previa del identificador de acceso</p>
              <div className="flex flex-wrap gap-2">
                {['E2600001', 'P2600001', 'A2600001'].map(code => <Button key={code} type="button" size="sm" variant={exampleCode === code ? 'default' : 'outline'} onClick={() => setExampleCode(code)}>{code.startsWith('E') ? 'Empleado' : code.startsWith('P') ? 'Apoderado' : 'Estudiante'}</Button>)}
              </div>
              <div className="font-mono text-base font-semibold break-all">{preview}</div>
              {abbreviationValid ? <p className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="h-3 w-3"/> Formato válido</p> : <p className="text-xs text-destructive">Escribe una abreviatura válida para obtener la vista previa.</p>}
              <p className="text-xs text-muted-foreground">Este es un identificador de acceso, no garantiza que exista un buzón de correo. Los identificadores ya emitidos no cambiarán si editas la abreviatura.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Información administrativa y de contacto</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {fields.map(({ key, label, placeholder }) => <div key={key} className={`space-y-2 ${key === 'address' ? 'md:col-span-2' : ''}`}><Label htmlFor={key}>{label}</Label><Input id={key} value={form[key] ?? ''} onChange={e => setField(key, e.target.value)} placeholder={placeholder}/>{fieldErrors[key] && <p className="text-xs text-destructive">{fieldErrors[key]}</p>}</div>)}
          </CardContent>
        </Card>
        <div className="flex justify-end"><Button disabled={saveInstitution.isPending} type="submit"><Save className="mr-2 h-4 w-4"/>{saveInstitution.isPending ? 'Guardando...' : 'Guardar configuración'}</Button></div>
      </form>
    </div>
  );
}
