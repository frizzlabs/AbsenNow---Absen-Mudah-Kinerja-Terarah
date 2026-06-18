<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceCorrection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'correction_date', 'correction_type',
        'proposed_checkin', 'proposed_checkout',
        'original_checkin', 'original_checkout',
        'justification', 'evidence_path', 'status',
        'reviewed_by', 'reviewed_at', 'review_note',
    ];

    protected $casts = [
        'correction_date' => 'date',
        'reviewed_at'     => 'datetime',
    ];

    public static array $typeLabels = [
        'forgot_checkin'  => 'Lupa Absen Datang',
        'forgot_checkout' => 'Lupa Absen Pulang',
        'gps_error'       => 'GPS Error',
        'app_error'       => 'Aplikasi Error',
        'dinas_luar'      => 'Dinas Luar',
        'other'           => 'Lainnya',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getTypeLabelAttribute(): string
    {
        return self::$typeLabels[$this->correction_type] ?? $this->correction_type;
    }
}
