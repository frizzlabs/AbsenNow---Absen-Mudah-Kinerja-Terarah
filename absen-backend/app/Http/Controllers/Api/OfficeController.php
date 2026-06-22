<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Office;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    private function authorizeManage(Request $request): void
    {
        abort_unless($request->user()->hasPermission('office.manage'), 403, 'Tidak ada akses kelola kantor.');
    }

    public function store(Request $request)
    {
        $this->authorizeManage($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_meters' => 'nullable|integer|min:10',
            'work_start' => 'nullable',
            'work_end' => 'nullable',
            'polygon_coordinates' => 'nullable|array',
        ]);

        $office = Office::create($data); // organization_id auto-stamped by trait

        return response()->json(['message' => 'Kantor dibuat.', 'office' => $office], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeManage($request);

        $office = Office::findOrFail($id); // scoped to current org by trait

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'radius_meters' => 'sometimes|integer|min:10',
            'work_start' => 'nullable',
            'work_end' => 'nullable',
            'polygon_coordinates' => 'nullable|array',
        ]);

        $office->update($data);

        return response()->json(['message' => 'Kantor diperbarui.', 'office' => $office]);
    }
}
