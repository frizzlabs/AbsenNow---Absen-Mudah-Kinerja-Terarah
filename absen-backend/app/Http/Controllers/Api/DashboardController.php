<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Leave;
use App\Models\Expense;
use App\Models\Overtime;
use App\Models\Timesheet;
use App\Models\Feedback;
use App\Models\Payslip;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Feed "Recent Updates" yang menggabungkan kejadian terbaru
     * dari beberapa modul untuk ditampilkan di dashboard home.
     */
    public function recentUpdates(Request $request)
    {
        $user = $request->user();
        $limit = (int) ($request->get('limit', 8));
        $updates = collect();

        // Leave
        foreach (Leave::where('user_id', $user->id)->latest('updated_at')->take(5)->get() as $l) {
            $updates->push($this->item(
                'leave',
                'calendar-outline',
                $this->statusColor($l->status),
                'Pengajuan Cuti ' . $this->statusLabel($l->status),
                $l->reason ?: ('Cuti ' . $l->leave_type),
                $l->updated_at,
                '/leave'
            ));
        }

        // Expense
        foreach (Expense::where('user_id', $user->id)->latest('updated_at')->take(5)->get() as $e) {
            $updates->push($this->item(
                'expense',
                'wallet-outline',
                $this->statusColor($e->status),
                'Reimbursement ' . $this->statusLabel($e->status),
                $e->merchant,
                $e->updated_at,
                '/expense'
            ));
        }

        // Overtime
        foreach (Overtime::where('user_id', $user->id)->latest('updated_at')->take(5)->get() as $o) {
            $updates->push($this->item(
                'overtime',
                'time-outline',
                $this->statusColor($o->status),
                'Lembur ' . $this->statusLabel($o->status),
                $o->title,
                $o->updated_at,
                '/overtime'
            ));
        }

        // Timesheet
        foreach (Timesheet::where('user_id', $user->id)->latest('updated_at')->take(5)->get() as $t) {
            $range = Carbon::parse($t->week_start_date)->format('d M') . ' - ' . Carbon::parse($t->week_end_date)->format('d M');
            $updates->push($this->item(
                'timesheet',
                'timer-outline',
                $this->statusColor($t->status),
                'Timesheet ' . $this->statusLabel($t->status),
                $range,
                $t->updated_at,
                '/timesheet'
            ));
        }

        // Feedback
        foreach (Feedback::where('user_id', $user->id)->latest('submitted_at')->take(3)->get() as $f) {
            $updates->push($this->item(
                'feedback',
                'chatbubble-ellipses-outline',
                'blue',
                'Feedback baru dari ' . $f->reviewer_name,
                $f->summary,
                $f->submitted_at ?: $f->created_at,
                '/performance/feedback-detail?id=' . $f->id
            ));
        }

        // Payslip
        foreach (Payslip::where('user_id', $user->id)->latest('paid_date')->take(2)->get() as $p) {
            $updates->push($this->item(
                'payslip',
                'receipt-outline',
                'green',
                'Slip Gaji Tersedia',
                $p->period_label,
                $p->paid_date ?: $p->updated_at,
                '/payslip'
            ));
        }

        $sorted = $updates
            ->filter(fn ($u) => $u['time'] !== null)
            ->sortByDesc('time')
            ->take($limit)
            ->values();

        return response()->json($sorted);
    }

    private function item(string $type, string $icon, string $color, string $title, ?string $message, $time, string $link): array
    {
        return [
            'type' => $type,
            'icon' => $icon,
            'color' => $color,
            'title' => $title,
            'message' => $message,
            'time' => $time ? Carbon::parse($time)->toIso8601String() : null,
            'link' => $link,
        ];
    }

    private function statusLabel(?string $status): string
    {
        return match ($status) {
            'approved', 'dibayar' => 'Disetujui',
            'rejected' => 'Ditolak',
            'pending', 'menunggu' => 'Menunggu',
            'revision' => 'Perlu Revisi',
            'diproses' => 'Diproses',
            default => ucfirst((string) $status),
        };
    }

    private function statusColor(?string $status): string
    {
        return match ($status) {
            'approved', 'dibayar' => 'green',
            'rejected' => 'red',
            'revision' => 'orange',
            'pending', 'menunggu', 'diproses' => 'blue',
            default => 'blue',
        };
    }
}
