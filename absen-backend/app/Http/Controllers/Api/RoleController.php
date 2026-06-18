<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\RolePermission;

class RoleController extends Controller
{
    private function authorizeManage(Request $request): void
    {
        abort_unless($request->user()->hasPermission('users.manage'), 403, 'Anda tidak memiliki akses untuk mengelola role.');
    }

    public function index(Request $request)
    {
        $this->authorizeManage($request);

        $roles = Role::withCount(['permissions', 'users'])->orderBy('id')->get();
        return response()->json($roles);
    }

    /**
     * Detail role + matriks permission (dikelompokkan per modul) untuk UI checklist.
     */
    public function show(Request $request, $id)
    {
        $this->authorizeManage($request);

        $role = Role::with('permissions')->find($id);
        if (!$role) {
            return response()->json(['message' => 'Role tidak ditemukan.'], 404);
        }

        $assigned = $role->permissions->pluck('id')->all();

        // Kelompokkan SEMUA permission per modul
        $modules = [];
        foreach (RolePermission::orderBy('id')->get() as $perm) {
            if (!isset($modules[$perm->module])) {
                $modules[$perm->module] = [
                    'module' => $perm->module,
                    'label' => $perm->module_label,
                    'permissions' => [],
                ];
            }
            $modules[$perm->module]['permissions'][] = [
                'id' => $perm->id,
                'name' => $perm->name,
                'action' => $perm->action,
                'action_label' => $perm->action_label,
            ];
        }

        return response()->json([
            'role' => $role->only(['id', 'name', 'label', 'description', 'is_system']),
            'assigned' => $assigned,
            'modules' => array_values($modules),
        ]);
    }

    /**
     * Simpan checklist privilege untuk sebuah role.
     */
    public function updatePermissions(Request $request, $id)
    {
        $this->authorizeManage($request);

        $request->validate([
            'permission_ids' => 'present|array',
            'permission_ids.*' => 'integer|exists:role_permissions,id',
        ]);

        $role = Role::find($id);
        if (!$role) {
            return response()->json(['message' => 'Role tidak ditemukan.'], 404);
        }

        if ($role->name === 'superadmin') {
            return response()->json(['message' => 'Super Admin selalu memiliki akses penuh dan tidak dapat diubah.'], 422);
        }

        $role->permissions()->sync($request->permission_ids);

        return response()->json([
            'message' => 'Privilege role berhasil disimpan.',
            'assigned' => $role->permissions()->pluck('role_permissions.id')->all(),
        ]);
    }
}
