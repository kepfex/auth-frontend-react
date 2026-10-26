import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePositions } from "@/features/positions/hooks/usePositions";
import { useSyncEmployeePositions } from "../hooks/useEmployees";
import type { Employee } from "../types/employee.types";

type Props = { employee: Employee; open: boolean; onOpenChange: (value: boolean) => void };

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    return data?.errors?.position_ids?.[0] ?? data?.message ?? "No se pudieron actualizar los cargos.";
  }
  return "No se pudieron actualizar los cargos.";
}

export function EmployeePositionsDialog({ employee, open, onOpenChange }: Props) {
  const [ids, setIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const positions = usePositions();
  const sync = useSyncEmployeePositions();
  useEffect(() => {
    if (open) {
      setIds(employee.positions.map((p) => p.id));
      setError("");
    }
  }, [open, employee.id, employee.positions]);

  const toggle = (id: number, checked: boolean) =>
    setIds((old) => checked ? [...old, id] : old.filter((value) => value !== id));

  const save = async () => {
    setError("");
    try {
      await sync.mutateAsync({ id: employee.id, payload: { position_ids: ids } });
      toast.success("Cargos actualizados correctamente.");
      onOpenChange(false);
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!sync.isPending) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar cargos institucionales</DialogTitle>
          <DialogDescription>
            Selecciona los cargos de {employee.person?.first_names} {employee.person?.paternal_surname}.
            Esta operación reemplaza su lista de cargos actual.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-3 overflow-y-auto py-2">
          {positions.isLoading && <p className="text-sm text-muted-foreground">Cargando cargos…</p>}
          {positions.isError && <p className="text-sm text-destructive">No se pudieron consultar los cargos.</p>}
          {positions.data?.map((position) => (
            <label key={position.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm">
              <Checkbox checked={ids.includes(position.id)} onCheckedChange={(checked) => toggle(position.id, checked === true)} disabled={sync.isPending}/>
              <span>{position.name}</span>
            </label>
          ))}
          {employee.positions.filter((p) => !positions.data?.some((active) => active.id === p.id)).map((p) => (
            <label key={p.id} className="flex items-center gap-3 rounded-md border p-3 text-sm text-muted-foreground">
              <Checkbox checked={ids.includes(p.id)} onCheckedChange={(checked) => toggle(p.id, checked === true)} disabled={sync.isPending}/>
              <span>{p.name} (cargo no disponible)</span>
            </label>
          ))}
          <p className="text-xs text-muted-foreground">Se permite dejar la lista vacía únicamente cuando el backend lo autorice. No podrás retirar Auxiliar si existen asignaciones escolares pendientes.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sync.isPending}>Cancelar</Button>
          <Button onClick={save} disabled={sync.isPending || positions.isLoading || positions.isError}>
            {sync.isPending && <Loader2 className="mr-2 size-4 animate-spin"/>}Guardar cargos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
