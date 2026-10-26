import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PersonDocumentSearch } from "@/features/students/components/person/PersonDocumentSearch";
import { useFindPersonByDocument } from "@/features/students/hooks/usePersonSearch";
import { usePositions } from "@/features/positions/hooks/usePositions";
import { useCreateEmployee } from "../hooks/useEmployees";
import { createEmployeeSchema } from "../schemas/employee.schema";
import type { CreatePersonRequest, DocumentType, Person } from "@/features/students/types/person.types";
import type { CreateEmployeeRequest } from "../types/employee.types";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };
const initialDetails = { first_names: "", paternal_surname: "", maternal_surname: "", phone: "", email: "", birth_date: "", address: "", sex: "" };
const prettyName = (person: Person) => [person.first_names, person.paternal_surname, person.maternal_surname].filter(Boolean).join(" ");

export function EmployeeCreateDialog({ open, onOpenChange }: Props) {
  const [docType, setDocType] = useState<DocumentType>("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [person, setPerson] = useState<Person | null>(null);
  const [searched, setSearched] = useState(false);
  const [details, setDetails] = useState(initialDetails);
  const [positionIds, setPositionIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const findPerson = useFindPersonByDocument();
  const create = useCreateEmployee();
  const positions = usePositions();

  const resetIdentity = () => { setPerson(null); setSearched(false); setError(""); };
  const resetAll = () => { setDocType("DNI"); setDocNumber(""); resetIdentity(); setDetails(initialDetails); setPositionIds([]); };
  const close = (next: boolean) => { if (create.isPending || findPerson.isPending) return; if (!next) resetAll(); onOpenChange(next); };
  const search = async () => {
    setError(""); setSearched(false); setPerson(null);
    if (docType === "DNI" && !/^\d{8}$/.test(docNumber.trim())) { setError("El DNI debe tener ocho dígitos."); return; }
    try {
      const found = await findPerson.mutateAsync({ document_type: docType, document_number: docNumber.trim() });
      setPerson(found); setSearched(true);
      if (found && !found.is_active) setError("La persona está inactiva y no puede registrarse como empleada.");
    } catch { setError("No se pudo consultar el documento. Inténtalo de nuevo."); }
  };
  const updateDetail = (name: keyof typeof initialDetails, value: string) => setDetails((old) => ({ ...old, [name]: value }));
  const togglePosition = (id: number, checked: boolean) => setPositionIds((old) => checked ? [...old, id] : old.filter((value) => value !== id));
  const submit = async () => {
    setError("");
    if (!searched) { setError("Busca primero el documento de la persona."); return; }
    if (person && !person.is_active) { setError("La persona está inactiva."); return; }
    const newPerson: CreatePersonRequest = {
      document_type: docType, document_number: docNumber.trim(), first_names: details.first_names.trim(),
      paternal_surname: details.paternal_surname.trim(), maternal_surname: details.maternal_surname.trim() || null,
      phone: details.phone.trim() || null, email: details.email.trim() || null,
      birth_date: details.birth_date || null, address: details.address.trim() || null,
      sex: details.sex === "M" || details.sex === "F" ? details.sex : null, is_active: true,
    };
    const payload: CreateEmployeeRequest = person
      ? { person_id: person.id, position_ids: positionIds }
      : { person: newPerson, position_ids: positionIds };
    const validated = createEmployeeSchema.safeParse(payload);
    if (!validated.success) { setError(validated.error.issues[0]?.message ?? "Revisa los campos del formulario."); return; }
    try {
      await create.mutateAsync(payload);
      toast.success("Empleado y cargos registrados correctamente.");
      resetAll(); onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const issues = err.response.data?.errors as Record<string, string[]> | undefined;
        setError(issues ? Object.values(issues).flat().join(" ") : (err.response.data?.message ?? "Revisa los datos."));
      } else setError("No se pudo registrar al empleado. Intenta nuevamente.");
    }
  };
  const busy = create.isPending;
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Registrar empleado</DialogTitle><DialogDescription>Busca una persona o registra sus datos; después selecciona los cargos institucionales.</DialogDescription></DialogHeader>
        <div className="space-y-5 py-2">
          <section className="space-y-3">
            <h3 className="font-semibold text-sm">1. Identificación de la persona</h3>
            <PersonDocumentSearch documentType={docType} documentNumber={docNumber} isSearching={findPerson.isPending} disabled={busy} onDocumentTypeChange={(value) => { setDocType(value); resetIdentity(); }} onDocumentNumberChange={(value) => { setDocNumber(value); resetIdentity(); }} onSearch={search} />
            {person && <div className="rounded-md border p-3 text-sm"><p className="font-medium">{prettyName(person)}</p><p className="text-muted-foreground">Persona existente · {person.document_type} {person.document_number}</p>{("employee_id" in person && person.employee_id != null) && <p className="text-destructive">Esta persona ya figura como empleada.</p>}</div>}
            {searched && !person && <div className="space-y-3 rounded-md border p-3"><p className="text-sm text-muted-foreground">Documento no registrado. Completa los datos de la persona nueva.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {([{ key: "first_names", label: "Nombres *" }, { key: "paternal_surname", label: "Apellido paterno *" }, { key: "maternal_surname", label: "Apellido materno" }, { key: "phone", label: "Teléfono" }, { key: "email", label: "Correo electrónico" }, { key: "birth_date", label: "Fecha de nacimiento" }, { key: "address", label: "Dirección" }] as const).map((field) => <div key={field.key} className={field.key === "address" ? "sm:col-span-2 space-y-1" : "space-y-1"}><Label htmlFor={`employee-${field.key}`}>{field.label}</Label><Input id={`employee-${field.key}`} type={field.key === "birth_date" ? "date" : field.key === "email" ? "email" : "text"} value={details[field.key]} onChange={(event) => updateDetail(field.key, event.target.value)} disabled={busy} /></div>)}
                <div className="space-y-1"><Label htmlFor="employee-sex">Sexo</Label><select id="employee-sex" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={details.sex} onChange={(event) => updateDetail("sex", event.target.value)} disabled={busy}><option value="">No especificado</option><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
              </div>
            </div>}
          </section>
          <section className="space-y-3"><h3 className="font-semibold text-sm">2. Cargos institucionales *</h3>
            {positions.isLoading ? <p className="text-sm text-muted-foreground">Cargando cargos…</p> : positions.isError ? <p className="text-sm text-destructive">No se pudieron cargar los cargos.</p> : positions.data?.length === 0 ? <p className="text-sm text-muted-foreground">No existen cargos activos.</p> : <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">{positions.data?.map((position) => <label key={position.id} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={positionIds.includes(position.id)} onCheckedChange={(checked) => togglePosition(position.id, checked === true)} disabled={busy}/><span>{position.name}</span></label>)}</div>}
            <p className="text-xs text-muted-foreground">Selecciona al menos un cargo. El código institucional se generará al guardar.</p>
          </section>
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => close(false)} disabled={busy}>Cancelar</Button><Button onClick={submit} disabled={busy || !searched || !!(person && (!person.is_active || ("employee_id" in person && person.employee_id != null))) || positionIds.length === 0 || positions.isLoading || positions.isError}>{busy && <Loader2 className="size-4 animate-spin" />}Registrar empleado</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
