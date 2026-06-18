<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kpi;
use App\Models\Feedback;
use App\Models\PerformanceReview;
use Illuminate\Support\Carbon;

class PerformanceController extends Controller
{
    /**
     * Ringkasan performa: skor, progres KPI, dan sorotan feedback.
     */
    public function overview(Request $request)
    {
        $user = $request->user();
        $period = $request->get('period') ?: $this->currentPeriod();

        $review = PerformanceReview::where('user_id', $user->id)
            ->where('period', $period)
            ->first();

        $kpis = Kpi::where('user_id', $user->id)->where('period', $period)->get();
        $totalKpis = $kpis->count();
        $completedKpis = $kpis->where('status', 'completed')->count();
        $rate = $totalKpis > 0 ? (int) round(($completedKpis / $totalKpis) * 100) : 0;

        $highlights = Feedback::where('user_id', $user->id)
            ->where('period', $period)
            ->orderBy('submitted_at', 'desc')
            ->take(2)
            ->get();

        return response()->json([
            'period' => $period,
            'review' => $review,
            'kpi_stats' => [
                'total' => $totalKpis,
                'completed' => $completedKpis,
                'rate' => $rate,
            ],
            'feedback_highlights' => $highlights,
        ]);
    }

    public function kpis(Request $request)
    {
        $user = $request->user();
        $query = Kpi::where('user_id', $user->id);

        if ($request->filled('period')) {
            $query->where('period', $request->period);
        }

        $kpis = $query->orderBy('id')->get();
        $total = $kpis->count();
        $completed = $kpis->where('status', 'completed')->count();

        return response()->json([
            'period' => $request->period ?: $this->currentPeriod(),
            'stats' => [
                'total' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
            ],
            'kpis' => $kpis,
        ]);
    }

    public function kpi(Request $request, $id)
    {
        $user = $request->user();
        $kpi = Kpi::with('histories')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$kpi) {
            return response()->json(['message' => 'KPI tidak ditemukan.'], 404);
        }

        return response()->json($kpi);
    }

    public function feedbacks(Request $request)
    {
        $user = $request->user();
        $query = Feedback::where('user_id', $user->id);

        if ($request->filled('period')) {
            $query->where('period', $request->period);
        }

        $feedbacks = $query->orderBy('submitted_at', 'desc')->get();

        return response()->json([
            'period' => $request->period ?: $this->currentPeriod(),
            'stats' => [
                'total' => $feedbacks->count(),
                'manager' => $feedbacks->where('type', 'manager')->count(),
                'peer' => $feedbacks->where('type', 'peer')->count(),
            ],
            'feedbacks' => $feedbacks->values(),
        ]);
    }

    public function feedback(Request $request, $id)
    {
        $user = $request->user();
        $feedback = Feedback::where('user_id', $user->id)->where('id', $id)->first();

        if (!$feedback) {
            return response()->json(['message' => 'Feedback tidak ditemukan.'], 404);
        }

        return response()->json($feedback);
    }

    public function acknowledge(Request $request, $id)
    {
        $user = $request->user();
        $feedback = Feedback::where('user_id', $user->id)->where('id', $id)->first();

        if (!$feedback) {
            return response()->json(['message' => 'Feedback tidak ditemukan.'], 404);
        }

        $feedback->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
        ]);

        return response()->json([
            'message' => 'Feedback berhasil dikonfirmasi.',
            'feedback' => $feedback,
        ]);
    }

    private function currentPeriod(): string
    {
        $now = Carbon::now();
        $quarter = (int) ceil($now->month / 3);
        return 'Q' . $quarter . ' ' . $now->year;
    }
}
