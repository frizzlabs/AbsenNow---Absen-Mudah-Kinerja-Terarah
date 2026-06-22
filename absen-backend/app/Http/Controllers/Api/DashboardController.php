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
use App\Models\Organization;
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

    public function news(Request $request)
    {
        $user = $request->user();
        if (!$user->organization_id) {
            return response()->json([]);
        }
        $org = $user->organization;
        
        $settings = $org->settings ?? [];
        $igUsername = $settings['instagram_username'] ?? 'pemkot_demo';

        $news = $this->getInstagramFeed($igUsername, $org);
        
        return response()->json($news);
    }

    private function getInstagramFeed(string $username, Organization $org): array
    {
        $cacheKey = "instagram_feed_{$org->id}_{$username}";
        
        return cache()->remember($cacheKey, now()->addHours(2), function () use ($username, $org) {
            $posts = [];
            $orgName = $org->name;
            
            $feedTemplates = [
                [
                    'type' => 'post',
                    'image' => 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop',
                    'caption' => "Kegiatan Rapat Koordinasi Tahunan Peningkatan Pelayanan Publik di lingkungan {$orgName}. Sinergi untuk mewujudkan pelayanan yang terarah, cepat, dan transparan bagi masyarakat. #PelayananPublik #Sinergitas",
                    'likes' => 1420,
                    'comments' => 84,
                    'shortcode' => 'C8h3O_RvxJ1',
                    'time_offset_hours' => 2
                ],
                [
                    'type' => 'reels',
                    'image' => 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop',
                    'caption' => "Highlight Peluncuran Aplikasi AbsenNow untuk digitalisasi kehadiran ASN {$orgName}. Absen mudah, kinerja terarah, untuk Indonesia maju! 🇮🇩✨ #DigitalisasiASN #AbsenNow #AparaturSipilNegara #SistemKehadiran",
                    'likes' => 3105,
                    'comments' => 192,
                    'shortcode' => 'C7e2B_YxtP8',
                    'time_offset_hours' => 6
                ],
                [
                    'type' => 'post',
                    'image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
                    'caption' => "Pemberian Penghargaan Pegawai Teladan Bulan Ini. Selamat kepada para ASN di {$orgName} yang telah menunjukkan dedikasi luar biasa. Terus tingkatkan prestasi dan integritas kerja! 🏆⭐ #ASNBerakhlak #PegawaiTeladan",
                    'likes' => 954,
                    'comments' => 45,
                    'shortcode' => 'C9j1K_KvzM2',
                    'time_offset_hours' => 18
                ],
                [
                    'type' => 'reels',
                    'image' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
                    'caption' => "Mari sukseskan program Gerakan Go Green & Penanaman 1000 Pohon di area pusat administrasi {$orgName}. Menuju lingkungan kantor yang hijau dan sehat! 🌱🌳 #GoGreen #LingkunganHidup #Penghijauan",
                    'likes' => 1850,
                    'comments' => 110,
                    'shortcode' => 'C5m8V_FrtL9',
                    'time_offset_hours' => 28
                ],
                [
                    'type' => 'post',
                    'image' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
                    'caption' => "Sosialisasi Regulasi Kinerja Terbaru berdasarkan Permenpan RB. Diskusi interaktif bersama narasumber ahli untuk menjamin pemahaman seluruh aparatur sipil {$orgName}. 📚💼 #RegulasiASN #ReformasiBirokrasi",
                    'likes' => 730,
                    'comments' => 29,
                    'shortcode' => 'C3u9P_MnbK4',
                    'time_offset_hours' => 42
                ]
            ];

            foreach ($feedTemplates as $index => $t) {
                $posts[] = [
                    'id' => $index + 1,
                    'type' => $t['type'],
                    'username' => strtolower(str_replace(' ', '_', $username)),
                    'profile_name' => $orgName,
                    'profile_pic' => $org->logo_url ?: 'assets/images/avatar.png',
                    'thumbnail_url' => $t['image'],
                    'caption' => $t['caption'],
                    'likes_count' => $t['likes'],
                    'comments_count' => $t['comments'],
                    'post_url' => "https://www.instagram.com/" . ($t['type'] === 'reels' ? 'reel' : 'p') . "/" . $t['shortcode'] . "/",
                    'published_at' => now()->subHours($t['time_offset_hours'])->toIso8601String()
                ];
            }

            return $posts;
        });
    }
}
