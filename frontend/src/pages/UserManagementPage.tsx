import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth, Role } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Shield, Loader2, CheckCircle2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const ROLES: Role[] = ["ADMIN", "MANAGER", "LECTURER", "STUDENT", "TECHNICIAN"];

const roleBadgeStyle: Record<Role, string> = {
  ADMIN:      "bg-red-500/20 text-red-400 border-red-500/30",
  MANAGER:    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LECTURER:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  STUDENT:    "bg-green-500/20 text-green-400 border-green-500/30",
  TECHNICIAN: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingRoles, setPendingRoles] = useState<Record<number, Role>>({});

  // Only ADMIN can access
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  const { data: users = [], isLoading } = useQuery<UserRecord[]>({
    queryKey: ["users-all"],
    queryFn: () => api.get("/user/all"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) =>
      api.patch(`/user/${id}/role`, { role }),
    onSuccess: (_, { id, role }) => {
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast({
        title: "Role updated",
        description: `User role changed to ${role}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role. Make sure you have ADMIN access.",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: number, role: Role) => {
    setPendingRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleSave = (userId: number) => {
    const role = pendingRoles[userId];
    if (role) roleMutation.mutate({ id: userId, role });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">
            Assign roles to registered users. Changes take effect on their next login.
          </p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base font-display">Registered Users</CardTitle>
            <Badge variant="secondary" className="ml-auto">{users.length}</Badge>
          </div>
          <CardDescription>
            All users who have logged in via Google. Assign them a role to control their access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => {
                const selectedRole = pendingRoles[u.id] ?? u.role;
                const isDirty = pendingRoles[u.id] && pendingRoles[u.id] !== u.role;
                const isSelf = u.email === user?.email;

                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {u.name?.charAt(0) ?? "?"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        {isSelf && (
                          <Badge variant="outline" className="text-[10px] py-0">You</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>

                    {/* Current role badge */}
                    <span className={`hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded border ${roleBadgeStyle[u.role]}`}>
                      {u.role}
                    </span>

                    {/* Role selector */}
                    <Select
                      value={selectedRole}
                      onValueChange={(v) => handleRoleChange(u.id, v as Role)}
                      disabled={isSelf} // prevent self-demotion
                    >
                      <SelectTrigger className="w-36 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-sm">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Save button */}
                    <Button
                      size="sm"
                      className="h-8 px-3"
                      disabled={!isDirty || isSelf || roleMutation.isPending}
                      onClick={() => handleSave(u.id)}
                    >
                      {roleMutation.isPending && roleMutation.variables?.id === u.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      <span className="ml-1.5">Save</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-4 pb-4 px-5">
          <p className="text-xs text-amber-400">
            <strong>Note:</strong> After changing a user's role, they need to log out and log in again
            for the new role to take effect. The role is stored in the MySQL database
            (<code className="bg-muted px-1 py-0.5 rounded text-[11px]">users</code> table).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
