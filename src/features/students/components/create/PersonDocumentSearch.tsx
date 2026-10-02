import {
  Loader2,
  Search,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  DocumentType,
} from "../../types/person.types";

interface PersonDocumentSearchProps {
  documentType: DocumentType;
  documentNumber: string;

  isSearching: boolean;
  disabled?: boolean;

  onDocumentTypeChange: (
    value: DocumentType,
  ) => void;

  onDocumentNumberChange: (
    value: string,
  ) => void;

  onSearch: () => void;
}

export const PersonDocumentSearch = ({
  documentType,
  documentNumber,
  isSearching,
  disabled = false,
  onDocumentTypeChange,
  onDocumentNumberChange,
  onSearch,
}: PersonDocumentSearchProps) => {
  const canSearch =
    documentNumber.trim().length > 0 &&
    !isSearching &&
    !disabled;

  return (
    <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
      <Select
        value={documentType}
        disabled={disabled}
        onValueChange={(value) =>
          onDocumentTypeChange(
            value as DocumentType,
          )
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="DNI">
            DNI
          </SelectItem>

          <SelectItem value="CE">
            Carné de extranjería
          </SelectItem>

          <SelectItem value="PASSPORT">
            Pasaporte
          </SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={documentNumber}
        disabled={disabled}
        placeholder="Número de documento"
        maxLength={
          documentType === "DNI"
            ? 8
            : 20
        }
        inputMode={
          documentType === "DNI"
            ? "numeric"
            : "text"
        }
        onChange={(event) => {
          let value =
            event.target.value;

          if (documentType === "DNI") {
            value = value.replace(
              /\D/g,
              "",
            );
          }

          onDocumentNumberChange(
            value,
          );
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            canSearch
          ) {
            event.preventDefault();
            onSearch();
          }
        }}
      />

      <Button
        type="button"
        variant="outline"
        disabled={!canSearch}
        onClick={onSearch}
      >
        {isSearching ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Search className="size-4" />
        )}

        Buscar
      </Button>
    </div>
  );
};