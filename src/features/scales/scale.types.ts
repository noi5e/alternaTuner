import type {
  DeleteScaleHandler,
  ScaleEditorMode,
} from "@/features/editor/editor.types";
import type { Tables } from "@/lib/database.types"; // auto-generated Supabase types

export type ScaleHeaderProps = {
  notesCount: number;
  setScaleTitle: (newTitle: string) => void;
  scaleTitle: string;
  isEditingAllowed: boolean;
  onSave?: () => void;
  onDelete?: DeleteScaleHandler;
  editorMode: ScaleEditorMode;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  onDismissSaveError: () => void;
  isOpeningSavedScale: boolean;
  onFavorite?: (isFavorite: boolean) => Promise<void>;
  isFavorite?: boolean;
  isPublic?: boolean;
  isUpdatingFavorite: boolean;
  isUpdatingVisibility?: boolean;
  onVisibilityChange?: (isPublic: boolean) => Promise<void>;
};

export type ScaleSideBarProps = {
  userScales: SideBarScale[];
  hasLoadedScales: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  favorites: SideBarScale[];
  hasLoadedFavorites: boolean;
  favoritesRefreshing: boolean;
  favoritesError: string | null;
  error: string | null;
  onRetry: () => void;
  onRetryFavorites: () => void;
};

export type ScaleListProps = {
  contentClassName?: string;
  label: string;
  scales: SideBarScale[];
  hasLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription: string;
  onNavigate: () => void;
};

export type ScaleListEmptyProps = {
  title: string;
  description: string;
};

export type ScaleSideBarLinkProps = {
  noteCount: number;
  title: string;
  id: string;
  onNavigate: () => void;
};

export type ScalePageContentProps = {
  scale: DatabaseScaleRowWithNotesAndDetails;
};

export type EditableScaleTitleProps = {
  value: string;
  isEditingAllowed: boolean;
  onChange: (value: string) => void;
};

export type FavoriteButtonProps = {
  isFavorite: boolean;
  onFavorite: (isFavorite: boolean) => Promise<void>;
  isUpdatingFavorite: boolean;
};

export type ScaleListErrorProps = {
  message: string;
  onRetry: () => void;
};

// link to user's individual scale in sidebar
export type SideBarScale = {
  id: string;
  title: string;
  noteCount: number;
};

export type SaveScaleButtonProps = {
  editorMode: ScaleEditorMode;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  isEditingAllowed: boolean;
  isOpeningSavedScale: boolean;
};

export type DeleteScaleDialogProps = {
  scaleTitle: string;
  onConfirm: DeleteScaleHandler;
  isSaving: boolean;
};

export type ScalesOutletContext = {
  // define type to avoid redundant type casting in child components, which depend on refreshScales() passed to them through Outlet context.
  refreshScales: () => Promise<void>; // thin wrapper of React Router's useOutletContext() hook
  refreshFavorites: () => Promise<void>;
};

export type UseScalesListProps = {
  userId: string | null;
  authLoading: boolean;
  apiMethod: (userId: string) => Promise<DatabaseScaleRowWithNoteCount[]>;
};

// single row from scale_notes table, with foreign key scale_id to scales table
export type DatabaseScaleNoteRow = Tables<"scale_notes">;

// single row from scales table (without its associated scale_notes, which are in another table)
export type DatabaseScaleRow = Tables<"scales">;

// single row from scales table WITH its associated scale_notes
export type DatabaseScaleRowWithNotes = Pick<
  DatabaseScaleRow,
  "id" | "title" | "created_at" | "updated_at" | "owner_id"
> & {
  scale_notes: DatabaseScaleNoteRow[];
};

// for sidebar context, where only noteCount is needed, and not the whole scale_notes row.
export type DatabaseScaleRowWithNoteCount = Pick<
  DatabaseScaleRow,
  "id" | "title" | "created_at" | "updated_at" | "owner_id"
> & {
  noteCount: number;
};

// includes favorite status, public visibility, and other metadata
export type DatabaseScaleRowWithNotesAndDetails = DatabaseScaleRowWithNotes & {
  isFavorite: boolean;
  isPublic: boolean;
};
