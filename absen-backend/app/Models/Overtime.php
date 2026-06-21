<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Overtime extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id',
        'user_id',
        'title',
        'overtime_date',
        'start_time',
        'end_time',
        'duration_hours',
        'reason',
        'attachment_path',
        'status',
    ];

    protected $casts = [
        'overtime_date' => 'date:Y-m-d',
        'duration_hours' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
