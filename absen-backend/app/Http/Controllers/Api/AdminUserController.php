<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Support\TenantContext;

class AdminUserController extends Controller
{
    private function authorizeManage(Request $request): void
    {
        abort_unless($request->user()->hasPermission('users.manage'), 403, 'Anda tidak memiliki akses untuk mengelola pengguna.');
    }

    public function index(Request $request)
    {
        $this->authorizeManage($request);

        $orgId = app(TenantContext::class)->id();

        $users = User::with('role')
            ->when($orgId, fn ($q) => $q->where('organization_id', $orgId))
            ->orderBy('name')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'position' => $u->position,
                'department' => $u->department,
                'role' => $u->role ? ['id' => $u->role->id, 'name' => $u->role->name, 'label' => $u->role->label] : null,
            ]);

        return response()->json($users);
    }

    /**
     * Buat pengguna baru di organisasi yang sedang aktif.
     */
    public function store(Request $request)
    {
        $this->authorizeManage($request);
        $orgId = app(TenantContext::class)->id();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'nullable|exists:roles,id',
            'department' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'employee_id' => 'nullable|string|max:255',
        ]);

        // Role harus milik organisasi ini
        if (!empty($data['role_id']) && $orgId) {
            $roleOk = Role::where('id', $data['role_id'])->where('organization_id', $orgId)->exists();
            abort_unless($roleOk, 422, 'Role tidak valid untuk instansi ini.');
        }

        $user = User::create([
            'organization_id' => $orgId,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'role_id' => $data['role_id'] ?? null,
            'department' => $data['department'] ?? null,
            'position' => $data['position'] ?? null,
            'employee_id' => $data['employee_id'] ?? null,
        ]);

        return response()->json(['message' => 'Pengguna dibuat.', 'user' => $user->load('role')], 201);
    }

    /**
     * Set role + posisi untuk seorang user.
     */
    public function updateRole(Request $request, $id)
    {
        $this->authorizeManage($request);

        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'position' => 'nullable|string|max:255',
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
        }

        $user->role_id = $request->role_id;
        if ($request->has('position')) {
            $user->position = $request->position;
        }
        $user->save();

        return response()->json([
            'message' => 'Role pengguna berhasil diperbarui.',
            'user' => $user->load('role'),
        ]);
    }

    /**
     * Permission & role milik user yang sedang login (untuk gating UI di aplikasi).
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('role');
        return response()->json([
            'role' => $user->role ? [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'label' => $user->role->label,
            ] : null,
            'position' => $user->position,
            'permissions' => $user->permissionNames(),
        ]);
    }
}
