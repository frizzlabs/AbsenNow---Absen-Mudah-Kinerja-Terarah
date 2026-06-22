<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\OrganizationRoleTemplateSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganizationController extends Controller
{
    private function authorizePlatform(Request $request): void
    {
        abort_unless($request->user()->isPlatformSuperadmin(), 403, 'Hanya super-admin platform.');
    }

    public function index(Request $request)
    {
        $this->authorizePlatform($request);
        return response()->json(Organization::withCount('users')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $this->authorizePlatform($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|alpha_dash|unique:organizations,code',
            'logo_url' => 'nullable|string|max:1000',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255',
            'admin_password' => 'required|string|min:8',
            'instagram_username' => 'nullable|string|max:100',
        ]);

        $result = DB::transaction(function () use ($data) {
            $settings = [
                'instagram_username' => !empty($data['instagram_username']) ? $data['instagram_username'] : 'pemkot_demo'
            ];
            $org = Organization::create([
                'name' => $data['name'],
                'code' => $data['code'],
                'logo_url' => $data['logo_url'] ?? null,
                'settings' => $settings,
            ]);

            (new OrganizationRoleTemplateSeeder())->forOrganization($org->id);

            $orgAdminRole = Role::where('organization_id', $org->id)->where('name', 'org_admin')->first();
            $admin = User::create([
                'organization_id' => $org->id,
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'password' => bcrypt($data['admin_password']),
                'role_id' => $orgAdminRole?->id,
                'position' => 'Administrator',
            ]);

            return ['org' => $org, 'admin' => $admin];
        });

        return response()->json([
            'message' => 'Instansi berhasil dibuat.',
            'organization' => $result['org'],
            'admin' => ['id' => $result['admin']->id, 'email' => $result['admin']->email],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePlatform($request);
        $org = Organization::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'logo_url' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
            'instagram_username' => 'nullable|string|max:100',
        ]);

        if (array_key_exists('instagram_username', $data)) {
            $settings = $org->settings ?? [];
            $settings['instagram_username'] = $data['instagram_username'];
            $org->settings = $settings;
            unset($data['instagram_username']);
        }

        $org->update($data);

        return response()->json(['message' => 'Instansi diperbarui.', 'organization' => $org]);
    }
}
