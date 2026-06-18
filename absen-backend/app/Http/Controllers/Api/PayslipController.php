<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payslip;

class PayslipController extends Controller
{
    /**
     * Daftar slip gaji milik user.
     * Filter opsional: year, month (1-12), status (dibayar|menunggu|diproses).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Payslip::where('user_id', $user->id);

        if ($request->filled('year')) {
            $query->whereYear('period_start', $request->year);
        }
        if ($request->filled('month')) {
            $query->whereMonth('period_start', $request->month);
        }
        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        $payslips = $query->orderBy('period_start', 'desc')->get();

        return response()->json($payslips);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $payslip = Payslip::with('items')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$payslip) {
            return response()->json(['message' => 'Slip gaji tidak ditemukan.'], 404);
        }

        // Kelompokkan item per seksi beserta totalnya
        $sections = [];
        foreach ($payslip->items as $item) {
            if (!isset($sections[$item->section])) {
                $sections[$item->section] = [
                    'section' => $item->section,
                    'label' => $this->sectionLabel($item->section),
                    'is_deduction' => $item->is_deduction,
                    'total' => 0,
                    'items' => [],
                ];
            }
            $sections[$item->section]['total'] += (float) $item->amount;
            $sections[$item->section]['items'][] = $item;
        }

        return response()->json([
            'payslip' => $payslip,
            'sections' => array_values($sections),
        ]);
    }

    private function sectionLabel(string $section): string
    {
        return match ($section) {
            'gaji_pokok' => 'Gaji Pokok',
            'tunjangan' => 'Tunjangan',
            'pajak_asuransi' => 'Pajak & Asuransi',
            'potongan_lain' => 'Potongan Lainnya',
            default => ucfirst($section),
        };
    }
}
