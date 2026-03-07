import { type FormEvent, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  UserPlus,
  SquarePen,
  ShieldAlert,
} from "lucide-react";
import { useQuery, useMutation } from "@apollo/client/react";
import { createPortal } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPhoneFa, formatDateFa, toEnglishDigits } from "@/lib/format";
import { t } from "@/lib/i18n";
import {
  GET_ALL_USERS_QUERY,
  CREATE_USERS_MUTATION,
  UPDATE_USERS_MUTATION,
  CHANGE_ROLES_MUTATION,
  DELETE_USERS_MUTATION,
} from "@/graphql/operations";
import type { User } from "@/types/models";
import type { UserRole } from "@/types/models";

const ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "JUDGE", "USER"];

interface NewUserRow {
  id: string;
  phone: string;
  password: string;
  role: UserRole;
  realName: string;
  displayName: string;
}

function RoleSelect({
  value,
  onValueChange,
  className,
}: {
  value: UserRole;
  onValueChange: (v: UserRole) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as UserRole)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {t(`role.${r.toLowerCase()}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function UserManagementPage() {
  const { data, loading } = useQuery<{ allUsers: User[] }>(GET_ALL_USERS_QUERY);
  const [createUsers, { loading: creating }] = useMutation(CREATE_USERS_MUTATION, {
    refetchQueries: [{ query: GET_ALL_USERS_QUERY }],
  });
  const [updateUsers, { loading: updating }] = useMutation(UPDATE_USERS_MUTATION, {
    refetchQueries: [{ query: GET_ALL_USERS_QUERY }],
  });
  const [changeRoles, { loading: changingRoles }] = useMutation(CHANGE_ROLES_MUTATION, {
    refetchQueries: [{ query: GET_ALL_USERS_QUERY }],
  });
  const [deleteUsers, { loading: deleting }] = useMutation(DELETE_USERS_MUTATION, {
    refetchQueries: [{ query: GET_ALL_USERS_QUERY }],
  });

  const allUsers = data?.allUsers ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  const users = useMemo(() => {
    let list = allUsers;
    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role === roleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const qLower = q.toLowerCase();
      const qForPhone = q.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
      list = list.filter(
        (u) =>
          u.phone.includes(q) ||
          u.phone.includes(qForPhone) ||
          u.realName?.toLowerCase().includes(qLower) ||
          u.displayName?.toLowerCase().includes(qLower),
      );
    }
    return list;
  }, [allUsers, roleFilter, searchQuery]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchRole, setBatchRole] = useState<UserRole | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalError, setAddModalError] = useState<string | null>(null);
  const [newRows, setNewRows] = useState<NewUserRow[]>([
    { id: crypto.randomUUID(), phone: "", password: "", role: "USER", realName: "", displayName: "" },
  ]);
  const [editPhoneUser, setEditPhoneUser] = useState<User | null>(null);
  const [editPhoneValue, setEditPhoneValue] = useState("");
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[] | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const visibleIds = new Set(users.map((u) => u.id));
    const allVisibleSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const addNewRow = () => {
    setNewRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), phone: "", password: "", role: "USER", realName: "", displayName: "" },
    ]);
  };

  const removeNewRow = (id: string) => {
    setNewRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateNewRow = (id: string, field: keyof NewUserRow, value: string | UserRole) => {
    setAddModalError(null);
    setNewRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const handleAddUsers = async (e: FormEvent) => {
    e.preventDefault();
    const valid = newRows.filter((r) => {
      const phoneClean = toEnglishDigits(r.phone).replace(/\D/g, "");
      return phoneClean.length >= 10 && toEnglishDigits(r.password).length >= 6;
    });
    if (valid.length === 0) {
      setAddModalError(t("common.fill_required_fields"));
      return;
    }
    setAddModalError(null);
    try {
      await createUsers({
        variables: {
          inputs: valid.map((r) => ({
            phone: toEnglishDigits(r.phone).replace(/\D/g, ""),
            password: toEnglishDigits(r.password),
            role: r.role,
            realName: r.realName.trim() || undefined,
            displayName: r.displayName.trim() || undefined,
          })),
        },
      });
      setMessage({ type: "success", text: t("user_management.success") });
      setAddModalOpen(false);
      setAddModalError(null);
      setNewRows([{ id: crypto.randomUUID(), phone: "", password: "", role: "USER", realName: "", displayName: "" }]);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("user_management.error");
      setAddModalError(msg);
    }
  };

  const handleBatchChangeRole = async () => {
    if (!batchRole || selectedIds.size === 0) return;
    try {
      await changeRoles({
        variables: {
          changes: Array.from(selectedIds).map((userId) => ({ userId, role: batchRole })),
        },
      });
      setMessage({ type: "success", text: t("user_management.success") });
      setSelectedIds(new Set());
      setBatchRole(null);
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: t("user_management.error") });
    }
  };

  const handleBatchDelete = async () => {
    if (!deleteTargetIds || deleteTargetIds.length === 0) return;
    try {
      await deleteUsers({ variables: { ids: deleteTargetIds } });
      setMessage({ type: "success", text: t("user_management.success") });
      setDeleteTargetIds(null);
      setSelectedIds(new Set());
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: t("user_management.error") });
    }
  };

  const startEditPhone = (user: User) => {
    setEditPhoneUser(user);
    setEditPhoneValue(formatPhoneFa(user.phone));
  };

  const saveEditPhone = async () => {
    if (!editPhoneUser || !editPhoneValue.trim()) {
      setEditPhoneUser(null);
      return;
    }
    const phoneClean = toEnglishDigits(editPhoneValue).replace(/\D/g, "");
    if (phoneClean.length < 10) {
      setMessage({ type: "error", text: t("common.field_required") });
      return;
    }
    try {
      await updateUsers({
        variables: {
          updates: [{ userId: editPhoneUser.id, input: { phone: phoneClean } }],
        },
      });
      setEditPhoneUser(null);
      setEditPhoneValue("");
      setMessage({ type: "success", text: t("user_management.success") });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: t("user_management.error") });
    }
  };

  const changeUserRole = async (userId: string, role: UserRole) => {
    try {
      await changeRoles({
        variables: { changes: [{ userId, role }] },
      });
      setMessage({ type: "success", text: t("user_management.success") });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: t("user_management.error") });
    }
  };

  const deleteSingleUser = (id: string) => {
    setDeleteTargetIds([id]);
  };

  const busy = creating || updating || changingRoles || deleting;

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-black text-slate-800">{t("user_management.title")}</h1>
        <p className="text-sm text-slate-600">{t("user_management.desc")}</p>
      </div>

      {message && (
        <Alert variant={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("user_management.search_placeholder")}
              className="h-11 pr-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{t("user_management.filter_by_role")}:</span>
            {(["ALL", "ADMIN", "JUDGE", "USER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                  roleFilter === r
                    ? "bg-primary-100 text-primary-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r === "ALL" ? t("user_management.filter_all") : t(`role.${r.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="flex-shrink-0">
          <UserPlus className="ml-2 h-4 w-4" />
          {t("user_management.add_user")}
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
          <span className="text-sm font-medium text-slate-700">
            {t("user_management.selected_count", { count: selectedIds.size })}
          </span>
          <div className="flex items-center gap-2">
            <RoleSelect
              value={batchRole ?? "USER"}
              onValueChange={setBatchRole}
              className="w-36"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleBatchChangeRole}
              disabled={!batchRole || busy}
            >
              {changingRoles ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("user_management.change_roles_batch")}
            </Button>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteTargetIds(Array.from(selectedIds))}
            disabled={busy}
          >
            {t("user_management.delete_selected")}
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldAlert className="mx-auto mb-4 h-14 w-14 text-slate-300" />
            <p className="text-base font-medium">{t("user_management.no_users")}</p>
            <p className="mt-2 text-sm">{t("user_management.add_first")}</p>
            <Button className="mt-6" onClick={() => setAddModalOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              {t("user_management.add_user")}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={users.length > 0 && users.every((u) => selectedIds.has(u.id))}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500">{t("user_management.phone")}</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">{t("user_management.real_name")}</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">{t("user_management.role")}</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">{t("user_management.created_at")}</th>
                  <th className="p-4 text-xs font-semibold text-slate-500" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span dir="ltr" className="font-medium text-slate-700">
                          {formatPhoneFa(user.phone)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditPhone(user)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                          title={t("user_management.edit_phone")}
                        >
                          <SquarePen className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-700">
                      {user.realName || user.displayName || "—"}
                    </td>
                    <td className="p-4">
                      <RoleSelect
                        value={user.role}
                        onValueChange={(role) => changeUserRole(user.id, role)}
                        className="min-w-[120px]"
                      />
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {formatDateFa(user.createdAt)}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => deleteSingleUser(user.id)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title={t("user_management.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open);
          if (!open) setAddModalError(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl p-6" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle>{t("user_management.add_users")}</DialogTitle>
          </DialogHeader>

          {addModalError ? (
            <Alert variant="error" className="mb-6">{addModalError}</Alert>
          ) : null}

          <form onSubmit={handleAddUsers} className="space-y-6" noValidate>
            {newRows.map((row) => (
              <div
                key={row.id}
                className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      {t("user_management.phone")} *
                    </label>
                    <PhoneInput
                      value={row.phone}
                      onChange={(v) => updateNewRow(row.id, "phone", v)}
                      placeholder={t("user_management.phone_placeholder")}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      {t("user_management.password")} *
                    </label>
                    <Input
                      type="password"
                      value={row.password}
                      onChange={(e) => updateNewRow(row.id, "password", e.target.value)}
                      placeholder={t("user_management.password_placeholder")}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      {t("user_management.role")}
                    </label>
                    <RoleSelect
                      value={row.role}
                      onValueChange={(v) => updateNewRow(row.id, "role", v)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        {t("user_management.real_name")}
                      </label>
                      <Input
                        value={row.realName}
                        onChange={(e) => updateNewRow(row.id, "realName", e.target.value)}
                        placeholder={t("user_management.real_name_placeholder")}
                        className="h-11"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-slate-600">
                          {t("user_management.display_name")}
                        </label>
                        <Input
                          value={row.displayName}
                          onChange={(e) => updateNewRow(row.id, "displayName", e.target.value)}
                          placeholder={t("user_management.display_name_placeholder")}
                          className="h-11"
                        />
                      </div>
                      {newRows.length > 1 && (
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNewRow(row.id)}
                            className="h-11 w-11 flex-shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <Button type="button" variant="outline" onClick={addNewRow}>
                <Plus className="ml-2 h-4 w-4" />
                {t("user_management.add_user")}
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
                  {t("user_management.cancel")}
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("user_management.save")}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPhoneUser} onOpenChange={(open) => !open && setEditPhoneUser(null)}>
        <DialogContent className="max-w-sm rounded-2xl p-6" dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("user_management.edit_phone")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                {t("user_management.phone")}
              </label>
              <PhoneInput
                value={editPhoneValue}
                onChange={setEditPhoneValue}
                placeholder={t("user_management.phone_placeholder")}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditPhoneUser(null)}
              >
                {t("user_management.cancel")}
              </Button>
              <Button
                className="flex-1"
                onClick={saveEditPhone}
                disabled={busy || !editPhoneValue.trim()}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("user_management.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {deleteTargetIds !== null &&
        deleteTargetIds.length > 0 &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}
            dir="rtl"
            onMouseDown={(e) => {
              if (!deleting && e.target === e.currentTarget) setDeleteTargetIds(null);
            }}
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="p-6">
                <h4 className="mb-3 text-center text-lg font-bold text-slate-800">
                  {t("user_management.delete_confirm_title")}
                </h4>
                <p className="mb-6 text-center text-sm leading-relaxed text-slate-600">
                  {t("user_management.delete_confirm", { count: deleteTargetIds.length })}
                </p>
                <div className="flex flex-row-reverse gap-3">
                  <button
                    onClick={handleBatchDelete}
                    disabled={deleting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {deleting ? t("user_management.deleting") : t("user_management.delete_action")}
                  </button>
                  <button
                    onClick={() => setDeleteTargetIds(null)}
                    disabled={deleting}
                    className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-70"
                  >
                    {t("user_management.cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
