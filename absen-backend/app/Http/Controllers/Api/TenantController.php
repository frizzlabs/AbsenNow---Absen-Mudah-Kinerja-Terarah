<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;

class TenantController extends Controller
{
    public function show(string $code)
    {
        $org = Organization::where('code', $code)->where('is_active', true)->firstOrFail();

        return response()->json([
            'name' => $org->name,
            'code' => $org->code,
            'logo_url' => $org->logo_url,
        ]);
    }
}
